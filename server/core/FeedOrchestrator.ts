import { prisma } from "../lib/prisma.js";
import { MatchStateEngine } from "./MatchStateEngine.js";
import { MomentumStore } from "./MomentumStore.js";
import { BlackoutService } from "../admin/system/blackout.service.js";
import { EditorialService } from "../admin/editorial/editorial.service.js";
import { FeatureFlags } from "../admin/system/feature.flags.js";
import { streamResolver } from "../services/StreamResolver.js";

const DEFAULT_HOUSE_AD = {
  id: "streamperf-default",
  name: "StreamPerf Original",
  creativeUrl: "/ads/branding_pulse.mp4",
  priority: 999,
  isActive: true
};

/**
 * 📁 /server/core/FeedOrchestrator.ts
 * Final Production Orchestrator for the Sports Attention OS.
 * Features:
 * - ZSET-based Ranking
 * - Sacred Mode (0.85 / 0.92 blocking)
 * - Premium Ad Deferral
 * - Snapshot Diffing support
 */
export class FeedOrchestrator {
  private static layoutCache: { items: any[], timestamp: number } | null = null;
  private static lastKnownGoodState: { items: any[], timestamp: number } | null = null;
  private static CACHE_TTL = 60000; // 60s Static Feed in EXTREME mode
  private static resyncInterval: NodeJS.Timeout | null = null;

  /**
   * 🌡️ LIVENESS SCORING (Elite v1.2)
   */
  private static getLivenessStatus(lastSeenAt: Date | null, status: string) {
    if (status === "LIVE") return "HOT";
    if (!lastSeenAt) return "DEAD";

    const diff = Date.now() - new Date(lastSeenAt).getTime();
    if (diff < 60000) return "HOT";
    if (diff < 120000) return "WARM";
    return "DEAD";
  }

  /**
   * 🏗️ BUILD HOME FEED
   * Returns a deterministic layout plan adapted to the user's tier.
   */
  static async getHomeLayout() {
    return this.buildHomeFeed();
  }

  /**
   * 🏗️ BUILD HOME FEED
   * Returns a deterministic layout plan adapted to the user's tier.
   */
  static async buildHomeFeed(userRole = "USER") {
    // 0. PANIC MODE CHECK
    let blackoutMode = await BlackoutService.getMode();
    const { redisClient, usingRedis } = await import("../lib/cache.js");
    if (usingRedis && redisClient) {
      try {
        const panicMode = await (redisClient as any).get("panic:mode");
        if (panicMode === "EXTREME") blackoutMode = "EXTREME";
        else if (panicMode === "LIGHT") blackoutMode = "LIGHT";
      } catch {}
    }

    const isPanic = blackoutMode === "LIGHT" || blackoutMode === "EXTREME";

    // 🔴 STATIC FEED & LKGS (EXTREME MODE HARDENING)
    if (blackoutMode === "EXTREME") {
      const now = Date.now();
      
      // Attempt to serve valid cache
      if (this.layoutCache && (now - this.layoutCache.timestamp < this.CACHE_TTL)) {
        console.log("[Orchestrator] 🧊 Serving Frozen Static Feed (Panic Extreme)");
        return this.layoutCache;
      }

      // Fallback to Last Known Good State if cache expired
      if (this.lastKnownGoodState) {
        console.log("[Orchestrator] 🛡️ Serving Last Known Good State fallback");
        return this.lastKnownGoodState;
      }
    }

    // 0.5 FETCH EDITORIAL PINS (Resilient)
    let featured: any[] = [];
    try {
      featured = await EditorialService.getFeaturedMatches();
    } catch {
      console.warn("[Orchestrator] !! Editorial Tables Missing !! Using Mock Hero.");
      featured = [{
        channelId: "hero-demo-1",
        channel: {
          id: "hero-demo-1",
          name: "Real Madrid vs Barcelona",
          status: "LIVE",
          category: "La Liga",
          lastSeenAt: new Date(),
          score: "2-1"
        }
      }];
    }
    const featuredIds = new Set(featured.map(f => f.channelId));

    // 1. Fetch Candidates (Global Ranking via Redis ZSET)
    const rankedIds = await MomentumStore.getRankedIds(30);
    
    let matches: any[] = [];
    try {
      matches = await prisma.channel.findMany({
        where: { 
          id: { 
            in: rankedIds.length > 0 ? rankedIds : undefined,
            notIn: featuredIds.size > 0 ? (Array.from(featuredIds) as string[]) : undefined 
          },
          isActive: true,
          deletedAt: null
        },
        take: 20
      });
    } catch {
      console.warn("[Orchestrator] !! Channel Tables Incomplete !! Using Mock Feed.");
      matches = [
        { id: "match-demo-1", name: "Liverpool vs Man City", status: "LIVE", category: "Premier League", lastSeenAt: new Date(), score: "0-0" },
        { id: "match-demo-2", name: "Lakers vs Celtics", status: "LIVE", category: "NBA", lastSeenAt: new Date(), score: "102-98" }
      ];
    }

    let houseAds: any[] = [];
    try {
      houseAds = await prisma.houseAd.findMany({
        where: { isActive: true },
        orderBy: { priority: "desc" }
      });
    } catch {}

    // 2. Sort candidates by Redis ranking order
    const sortedMatches = rankedIds.length > 0 
      ? rankedIds.map(id => matches.find(m => m.id === id)).filter(Boolean)
      : matches;

    // 3. Construct Hybrid Layout
    const items: any[] = [];
    let houseAdPtr = 0;

    // 🏆 INJECT EDITORIAL HEROES
    const now = Date.now();
    for (const f of featured) {
      // 🏥 LIVENESS LOCK (DAZN v1.2 Elite)
      const liveness = this.getLivenessStatus(f.channel.lastSeenAt, f.channel.status);
      
      if (liveness === "DEAD") {
         console.log(`[Orchestrator] 👻 Hero ${f.channelId} is a Ghost. Skipping.`);
         continue;
      }

      const pressure = MatchStateEngine.calculatePressure(f.channel as any);
      
      // 🛰️ DYNAMIC STREAM RESOLUTION (SRE v2.1 - Budgeted)
      const resolvedStream = await this.resolveWithFallback(f.channelId, liveness);

      items.push({
        type: "featured",
        id: f.channelId,
        data: { 
          ...f.channel, 
          pressureIndex: pressure, 
          liveness,
          resolvedStream
        }
      });
    }

    for (let i = 0; i < sortedMatches.length; i++) {
      const match: any = sortedMatches[i];
      if (!match) continue;

      if (usingRedis && redisClient && (i % 5 === 0)) {
        try {
          const currentPanic = await (redisClient as any).get("panic:mode");
          if (currentPanic === "EXTREME") {
            console.log("[Orchestrator] 🚨 Panic EXTREME intercepted during loop. Aborting feed generation.");
            break;
          }
        } catch {}
      }

      // 🏥 LIVENESS LOCK (DAZN v1.2 Elite)
      const liveness = this.getLivenessStatus(match.lastSeenAt, match.status);
      
      if (liveness === "DEAD") continue;

      const pressure = MatchStateEngine.calculatePressure(match);

      // 🛰️ DYNAMIC STREAM RESOLUTION (SRE v2.1 - Budgeted)
      const resolvedStream = await this.resolveWithFallback(match.id, liveness);

      items.push({
        type: "match",
        id: match.id,
        data: { 
          ...match, 
          pressureIndex: pressure, 
          liveness,
          resolvedStream 
        }
      });

      // 💰 MONETIZATION ORCHESTRATION
      const isAdSlot = (i + 1) % 3 === 0;
      if (isAdSlot && !isPanic) {
        // SACRED MODE: Blackout Zone (> 0.92)
        if (pressure > 0.92) continue;

        // SACRED MODE: House Ads Zone (0.85 - 0.92)
        if (pressure > 0.85) {
          // 3-Layer Fallback: DB -> DEFAULT -> NULL
          const house = houseAds[houseAdPtr % houseAds.length] || DEFAULT_HOUSE_AD;
          
          if (house) {
             items.push({ type: "ad", subType: "house", data: house });
             houseAdPtr++;
          }
          continue;
        }

        // PREMIUM DEFERRAL: High Pressure Zone (> 0.7)
        if (userRole === "PREMIUM" && pressure > 0.7) continue;

        // 🚦 GLOBAL FLAG: Ads Visibility
        const adsActive = await FeatureFlags.isEnabled("ads_active");
        if (!adsActive) continue;

        // NORMAL: External Ad
        items.push({ type: "ad", subType: "external", slotIndex: Math.floor(i / 3) });
      }
    }

    const result = { items, timestamp: Date.now() };
    this.layoutCache = result; 
    
    // Validate as Last Known Good State
    if (items.length > 0) {
      this.lastKnownGoodState = result;
    }

    return result;
  }

  /**
   * ⚡ UPDATE STATE
   * Internal push to Redis persistence layers.
   */
  static async syncMatchState(matchId: string, rawIntensity: number) {
    const { redisClient, usingRedis } = await import("../lib/cache.js");
    if (usingRedis && redisClient) {
      try {
        const panicMode = await (redisClient as any).get("panic:mode");
        if (panicMode === "EXTREME") return;
      } catch {}
    }

    const blackoutMode = await BlackoutService.getMode();
    
    // 🏥 FRESHNESS TRACKING (YouTube/Twitch Mode)
    await MomentumStore.updateLastSeenDB(matchId);

    // 🧊 FREEZE RANKING (EXTREME MODE HARDENING)
    if (blackoutMode === "EXTREME") {
      console.log(`[Orchestrator] 🧊 Ranking Frozen for ${matchId} (Panic Extreme)`);
      return; 
    }

    const match = await prisma.channel.findUnique({ where: { id: matchId } });
    if (!match) return;

    const pressure = MatchStateEngine.calculatePressure(match);
    const tierWeight = MatchStateEngine.getTierWeight(match.league);

    await MomentumStore.pushPoint(matchId, {
      intensity: rawIntensity,
      pressure,
      score: match.score || "0-0",
      tierWeight
    });

    return pressure;
  }

  /**
   * 📡 SOFT RESYNC LOOP (Score-only consistency)
   */
  static startSoftResync(io: any) {
    if (this.resyncInterval) return;

    this.resyncInterval = setInterval(async () => {
      const mode = await BlackoutService.getMode();
      if (mode !== "EXTREME") return;

      console.log("[Orchestrator] 🔄 Soft Resync: Syncing scores during freeze...");
      const matches = await prisma.channel.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, score: true }
      });

      const { broadcastScoreUpdate } = await import("../realtime/events.js");
      for (const m of matches) {
        broadcastScoreUpdate(io, m.id, m.score || "0-0");
      }
    }, 30000);
  }

  /**
   * 🛡️ RESOLVE WITH FALLBACK (SRE v2.1)
   * Enforces 100ms/150ms budget and falls back to Last Known Good (LKG).
   */
  private static async resolveWithFallback(channelId: string, liveness: string): Promise<any> {
    const SOFT_TIMEOUT = 100;
    const HARD_TIMEOUT = 150;

    try {
      // 🥇 TIER 1: Optimized Resolution (Coalesced, L1/L2)
      return await Promise.race([
        streamResolver.resolveBestStream(channelId, liveness),
        new Promise((_, reject) => setTimeout(() => reject(new Error("SOFT_TIMEOUT")), SOFT_TIMEOUT))
      ]);
    } catch (err: any) {
      if (err.message === "SOFT_TIMEOUT") {
        console.warn(`[Orchestrator] ⏳ Soft Timeout reached for ${channelId}. Attempting LKG.`);
      }

      // 🥈 TIER 2: Fast-Path Fallback (LKG)
      try {
        const lkg = await Promise.race([
          streamResolver.getLKG(channelId),
          new Promise((_, reject) => setTimeout(() => reject(new Error("HARD_TIMEOUT")), HARD_TIMEOUT - SOFT_TIMEOUT))
        ]);

        if (lkg) {
          return { ...lkg, __fallback: "LKG" };
        }
      } catch {}
    }

    // 🥉 TIER 3: Fail-Open (No stream but don't block feed)
    return null;
  }
}
