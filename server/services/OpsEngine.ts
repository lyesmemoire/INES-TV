import { prisma } from "./db.js";
import { redisClient, usingRedis } from "../lib/cache.js";
import { OpsMetrics } from "../admin/system/ops.metrics.js";
import { FeatureFlags } from "../admin/system/feature.flags.js";
import { momentumEngine } from "./MomentumEngine.js";
import { preWarmingEngine } from "./PreWarmingEngine.js";
import { autoHeroEngine } from "./AutoHeroEngine.js";
import { adPricingEngine } from "./AdPricingEngine.js";
import { panicEngine } from "./PanicEngine.js";

/**
 * 📁 /server/services/OpsEngine.ts
 * The "Real-time NOC Brain" — v1.5.1 TACTICAL FORESIGHT PATCHED
 *
 * Câblage des singletons MomentumEngine + PreWarmingEngine v1.5.1 :
 *   ✅ momentumEngine.ingest() + analyze() (class-based, noise-filtered)
 *   ✅ preWarmingEngine.decide() async avec confidence gate + Redis cooldown
 *   ✅ executePrewarm() async fire-and-forget (non-bloquant sur le tick 1s)
 *   ✅ confidence exposée dans le payload broadcast
 *   ✅ Cleanup via pruneStale() sur les deux singletons
 */
export class OpsEngine {
  private static interval: NodeJS.Timeout | null = null;
  private static forecastInterval: NodeJS.Timeout | null = null;
  private static tickCount = 0;

  // ──────────────────────────────────────────────────────────────────────────
  // START
  // ──────────────────────────────────────────────────────────────────────────

  static start(io: any) {
    if (this.interval) return;

    const opsNs = io.of("/ops");

    // ── 1s TICK — heatmap broadcast ────────────────────────────────────────
    this.interval = setInterval(async () => {
      this.tickCount++;

      try {
        // ========================
        // 🚨 AUTO PANIC GUARD
        // ========================
        let panicState: "NONE" | "LIGHT" | "EXTREME" = await panicEngine.evaluate();
        if (panicState === "EXTREME") return; // hard stop, save CPU & Redis

        let lastPanicCheck = Date.now();
        const getPanicCached = async () => {
          const now = Date.now();
          if (now - lastPanicCheck > 200) {
            if (usingRedis && redisClient) {
              try {
                const mode = await (redisClient as any).get("panic:mode");
                if (mode) panicState = mode;
              } catch {}
            }
            lastPanicCheck = now;
          }
          return panicState;
        };

        // 1. AGGREGATE NODES (Matrix Heatmap)
        const channels = await prisma.channel.findMany({
          where: { isActive: true, deletedAt: null },
          select: { id: true, status: true, lastSeenAt: true },
          take: 100,
        });

        const heatmapNodes: any[] = [];

        for (let i = 0; i < channels.length; i++) {
            const currentPanic = await getPanicCached();
            if (currentPanic === "EXTREME") {
                console.log("[OpsEngine] 🚨 EXTREME panic intercepted inside 1s loop. Halting.");
                break;
            }

            const c = channels[i];
            let pressure = 0;
            let failoverCount = 0;
            const activeSource = "m3u";

            if (usingRedis && redisClient) {
              const state = await (redisClient as any).hgetall(`match:${c.id}:state`);
              pressure = state?.pressure ? parseFloat(state.pressure) : 0;

              const nodeMetrics = await (redisClient as any).hgetall(
                `ops:metrics:channel:${c.id}`
              );
              failoverCount = parseInt(nodeMetrics?.failovers || "0");
            }

            // Liveness Tiering
            const diff = c.lastSeenAt
              ? Date.now() - new Date(c.lastSeenAt).getTime()
              : 999999;
            let liveness: "HOT" | "WARM" | "DEAD" | "FAILOVER" = "DEAD";
            if (failoverCount > 0) liveness = "FAILOVER";
            else if (c.status === "LIVE" || diff < 60000) liveness = "HOT";
            else if (diff < 120000) liveness = "WARM";

            // Viewer Count (HOT / FAILOVER only)
            let viewerCount: number | undefined;
            if (liveness === "HOT" || liveness === "FAILOVER") {
              viewerCount = Math.floor(Math.random() * 5000) + 1200;
            }

            // ── v1.5.1: MOMENTUM ─────────────────────────────────────────
            await momentumEngine.ingest(c.id, pressure);
            const momentum = momentumEngine.analyze(c.id);

            // ── v1.5.1: PRE-WARMING (async, non-bloquant) ─────────────────
            const prewarmDecision = await preWarmingEngine.decide(c.id, {
              heatAcceleration: momentum?.heatAcceleration ?? 0,
              confidence: momentum?.confidence ?? 0,
              liveness,
              prewarmRecommended: momentum?.prewarmRecommended ?? false,
              isPremium: false,
            });

            if (prewarmDecision.shouldPrewarm) {
              preWarmingEngine.executePrewarm(prewarmDecision).catch((e) =>
                console.error(`[OpsEngine] Prewarm exec failed: ${c.id}`, e)
              );
            }

            heatmapNodes.push({
              id: c.id,
              liveness,
              pressure,
              status: c.status,
              failoverCount,
              activeSource,
              viewerCount,
              lastSeenAt: c.lastSeenAt
                ? new Date(c.lastSeenAt).getTime()
                : 0,
              momentum: momentum
                ? {
                    slope_30s: momentum.slope_30s,
                    slope_60s: momentum.slope_60s,
                    heatAcceleration: momentum.heatAcceleration,
                    predictedTransition: momentum.predictedTransition,
                    predictedPressure: momentum.predictedPressure,
                    confidence: momentum.confidence,
                    prewarmRecommended: momentum.prewarmRecommended,
                    degradationWarning: momentum.degradationWarning,
                  }
                : null,
              prewarmTier: prewarmDecision.tier,
              degradationWarning: momentum?.degradationWarning ?? false,
            });
        }

        // 2. CORE METRICS
        const metrics = await OpsMetrics.getMetrics();
        const adsActive = await FeatureFlags.isEnabled("ads_active");
        const prewarmStats = preWarmingEngine.getStats();

        // 3. BROADCAST — heatmap (1s)
        opsNs.to("ops:heatmap").emit("heatmap:snapshot", heatmapNodes);

        // 4. BROADCAST — metrics (1s)
        opsNs.to("ops:status").emit("metrics:snapshot", {
          ...metrics,
          ads_active: adsActive,
          prewarm: prewarmStats,
          ts: Date.now(),
        });

        // 5. CLEANUP — every 60 ticks (~1 min)
        if (this.tickCount % 60 === 0) {
          momentumEngine.pruneStale();
          preWarmingEngine.pruneStale();
        }
      } catch (e) {
        console.error("[OpsEngine] NOC Broadcast Failed", e);
      }
    }, 1000);

    // ── 5s TICK — forecast broadcast ───────────────────────────────────────
    this.forecastInterval = setInterval(async () => {
      try {
        // ========================
        // 🚨 AUTO PANIC
        // ========================
        const panicMode = await panicEngine.evaluate();

        if (panicMode === "EXTREME") {
            return; // hard stop
        }

        const topMomentum = momentumEngine.getTopMomentumChannels(20);
        
        // AUTO HERO
        await autoHeroEngine.evaluate(topMomentum);

        // AD PRICING
        if (usingRedis && redisClient) {
            for (const snap of topMomentum) {
              const cpm = adPricingEngine.computeCPM(
                1.2, // Base CPM
                snap.heatAcceleration,
                snap.predictedTransition
              );
              // Push to redis / metrics
              await (redisClient as any).hset("ads:dynamic", snap.channelId, cpm.toString());
            }
        }

        if (topMomentum.length > 0) {
          opsNs.to("ops:forecast").emit("forecast:snapshot", {
            channels: topMomentum,
            ts: Date.now(),
          });
        }
      } catch (e) {
        console.error("[OpsEngine] Forecast Broadcast Failed", e);
      }
    }, 5000);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STOP
  // ──────────────────────────────────────────────────────────────────────────

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.forecastInterval) {
      clearInterval(this.forecastInterval);
      this.forecastInterval = null;
    }
    this.tickCount = 0;
  }
}
