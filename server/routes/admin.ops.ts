import { Router } from "express";
import { OpsMetrics } from "../admin/system/ops.metrics.js";
import { FeatureFlags } from "../admin/system/feature.flags.js";
import { hybridAuth } from "../admin/auth/hybridAuth.js";
import { momentumEngine } from "../services/MomentumEngine.js";
import { preWarmingEngine } from "../services/PreWarmingEngine.js";

/**
 * 📁 /server/routes/admin.ops.ts
 * Operational Control Plane API — v1.5 TACTICAL FORESIGHT
 * Protected by hybridAuth (Supabase RBAC + Admin Secret).
 */
const router = Router();

// ── PUBLIC TELEMETRY (Internal Rate Limited) ─────────────────────────────────

router.post("/metrics/failover", async (req, res) => {
  await OpsMetrics.track("failover");
  res.sendStatus(200);
});

router.post("/metrics/circuit-breaker", async (req, res) => {
  await OpsMetrics.track("circuit_breaker_triggered");
  res.sendStatus(200);
});

// ── PROTECTED ADMIN OPS ──────────────────────────────────────────────────────

router.use(hybridAuth);

router.get("/metrics", async (req, res) => {
  const metrics = await OpsMetrics.getMetrics();
  res.json(metrics);
});

router.post("/flags/toggle", async (req, res) => {
  const { flag, enabled, actor } = req.body;
  if (enabled) {
    await FeatureFlags.enable(flag, actor || "admin");
  } else {
    await FeatureFlags.disable(flag, actor || "admin");
  }
  res.json({ success: true, flag, enabled });
});

/**
 * 📊 NOC INITIAL SNAPSHOT
 */
router.get("/snapshot", async (req, res) => {
  const { prisma } = await import("../services/db.js");
  const channels = await prisma.channel.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, status: true, lastSeenAt: true },
    take: 100,
  });

  const snapshot = channels.map((c) => ({
    id: c.id,
    status: c.status,
    liveness: "WARM",
    lastSeenAt: c.lastSeenAt ? new Date(c.lastSeenAt).getTime() : 0,
  }));

  res.json(snapshot);
});

/**
 * 🚦 GLOBAL FLAGS STATE
 */
router.get("/flags", async (req, res) => {
  const flags = ["ads_active", "failover_active", "watchdog_enabled", "panic_mode"];
  const state: Record<string, boolean> = {};
  for (const f of flags) {
    state[f] = await FeatureFlags.isEnabled(f);
  }
  res.json(state);
});

/**
 * 🔮 FORECAST ENDPOINT — v1.5.1 TACTICAL FORESIGHT PATCHED
 * Returns top-20 channels with active momentum, sorted by |heatAcceleration| DESC.
 * Includes predicted transitions, pre-warm recommendations, and confidence scores.
 */
router.get("/forecast", async (req, res) => {
  const k = Math.min(parseInt((req.query.k as string) || "20"), 50);
  const topChannels = momentumEngine.getTopMomentumChannels(k);
  const prewarmStats = preWarmingEngine.getStats();

  res.json({
    ts: Date.now(),
    horizon: "3–5min",
    prewarmStats,
    channels: topChannels.map((s) => ({
      channelId: s.channelId,
      heatAcceleration: s.heatAcceleration,
      slope_30s: s.slope_30s,
      slope_60s: s.slope_60s,
      slope_180s: s.slope_180s,
      predictedPressure: s.predictedPressure,
      predictedTransition: s.predictedTransition,
      confidence: s.confidence,
      prewarmRecommended: s.prewarmRecommended,
      degradationWarning: s.degradationWarning,
    })),
  });
});

export default router;
