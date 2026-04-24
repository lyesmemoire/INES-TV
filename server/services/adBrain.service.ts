import { CampaignCache } from "../core/memory/CampaignCache.js";
import { getGeoIndex, GEO_WEIGHTS_ARRAY } from "../core/memory/GeoConstants.js";
import { analyticsStore } from "../core/memory/AnalyticsStore.js";
import { PlanStore } from "../core/memory/PlanStore.js";

/* ============================================================
   1. TYPES & CONFIG
============================================================ */

export type Geo = "US" | "EU" | "MA" | "TN" | "DZ" | "OTHER";
export type Segment = "PREMIUM" | "STANDARD" | "LOW";
export type Device = "MOBILE" | "DESKTOP";

export interface BidContext {
  userId?: string;
  tenantId: string;
  geo?: Geo;
  segment?: Segment;
  device?: Device;
  qoeScore?: number;
  trustScore?: number;
  totalMultiplier?: number;
}

export interface AuctionResult {
  bidderId: string | null;
  price: number;
  rawScore: number;
  shaded: boolean;
  isFallback: boolean;
  warning?: string; 
  __released?: boolean; // Safe Pool Pattern
}

/** Bidder contract used by InternalMarketplace and shadow services */
export interface Bidder {
  id: string;
  baseEcpm: number;
  reliability: number;
  avgLatency: number;
}

/* ============================================================
   2. INFRASTRUCTURE: POOLING & IN-MEMORY CACHE
============================================================ */

const RESULT_POOL: AuctionResult[] = [];

function acquireResult(): AuctionResult {
  const res = RESULT_POOL.pop() || {
    bidderId: null,
    price: 0,
    rawScore: 0,
    shaded: false,
    isFallback: false,
  };
  
  // ⚡ FULL RESET (v4 Hardening)
  res.__released = false;
  res.bidderId = null;
  res.price = 0;
  res.rawScore = 0;
  res.shaded = false;
  res.isFallback = false;
  res.warning = undefined;

  return res;
}

export function releaseResult(res: AuctionResult) {
  if (res.__released) return; // Prevent double-release
  res.__released = true;

  // GC Hint & Cleanup
  res.bidderId = null;
  res.warning = undefined;

  if (RESULT_POOL.length < 2000) RESULT_POOL.push(res);
}

let currentFloor = 0.50; // Starting base floor (ecpm)
const BASE_FLOOR = 0.50;

export const AdBrain = {
  /**
   * 🏆 GOOGLE-GRADE AUCTION ENGINE (Sub-0.3ms Target)
   * Inline SoA Kernel, Zero function calls, Zero object chasing.
   */
  runAuction(ctx: BidContext): AuctionResult {
    // 🛡️ REVENUE-UNLOCK PAYWALL
    const planCheck = PlanStore.checkLimit(ctx.tenantId);
    if (!planCheck.allowed) {
      analyticsStore.recordBlocked();
      const res = acquireResult();
      res.isFallback = true;
      return res;
    }

    const geoIdx = getGeoIndex(ctx.geo || "OTHER");
    const candidateIndices = CampaignCache.getIndicesByGeo(geoIdx);
    const len = candidateIndices.length;

    // ⚡ FAST PATH: Zero bidders
    if (len === 0) {
      const res = acquireResult();
      res.isFallback = true;
      return res;
    }

    const totalMultiplier = (ctx as any).totalMultiplier || 1.0;

    const { bids, qualities, campaignIds } = CampaignCache.getRawData();
    let bestScore = 0;
    let winnerIdx = -1;

    // 🔥 ULTRA-HOT LOOP: SIMD-style Unrolling (4 bidders per step)
    const n = len - (len % 4);
    let i = 0;

    for (; i < n; i += 4) {
      // Unrolled Slot 0
      const idx0 = candidateIndices[i];
      const score0 = bids[idx0] * qualities[idx0] * totalMultiplier;
      if (score0 > bestScore) { bestScore = score0; winnerIdx = idx0; }

      // Unrolled Slot 1
      const idx1 = candidateIndices[i + 1];
      const score1 = bids[idx1] * qualities[idx1] * totalMultiplier;
      if (score1 > bestScore) { bestScore = score1; winnerIdx = idx1; }

      // Unrolled Slot 2
      const idx2 = candidateIndices[i + 2];
      const score2 = bids[idx2] * qualities[idx2] * totalMultiplier;
      if (score2 > bestScore) { bestScore = score2; winnerIdx = idx2; }

      // Unrolled Slot 3
      const idx3 = candidateIndices[i + 3];
      const score3 = bids[idx3] * qualities[idx3] * totalMultiplier;
      if (score3 > bestScore) { bestScore = score3; winnerIdx = idx3; }
    }

    // 🔥 Remainder Loop
    for (; i < len; i++) {
        const idx = candidateIndices[i];
        const score = bids[idx] * qualities[idx] * totalMultiplier;
        if (score > bestScore) {
          bestScore = score;
          winnerIdx = idx;
        }
    }

    const result = acquireResult();

    if (winnerIdx === -1) {
      analyticsStore.recordFallback();
      result.isFallback = true;
      return result;
    }

    result.bidderId = campaignIds[winnerIdx];
    result.price = bids[winnerIdx];
    result.rawScore = bestScore;
    result.isFallback = false;

    return result;
  },

  /**
   * 📈 SMART REVENUE TUNING (Google-Grade)
   */
  adjustFloor(fillRate: number) {
    const stats = analyticsStore.getStats();
    // rpmTrend approximated from fillRate delta: rising fill → higher floor
    const rpmTrend = fillRate > 0.7 ? 0.05 : (fillRate < 0.3 ? -0.05 : 0);
    const allActiveCount = CampaignCache.getRawData().activeFlags.reduce((a, b) => a + Number(b), 0);
    const competitionLevel = allActiveCount / 10;

    const newFloor = BASE_FLOOR * (1 + rpmTrend) * (1 + competitionLevel);
    currentFloor = (currentFloor * 0.7) + (newFloor * 0.3);

    console.log(`💎 [Yield] Smart Floor Tuned: $${currentFloor.toFixed(3)} (FillRate: ${fillRate.toFixed(2)}, Comp: ${competitionLevel.toFixed(2)})`);
  },

  resolveAd(ctx: BidContext): AuctionResult {
    const result = this.runAuction(ctx);
    if (!result.isFallback) return result;
    return result; 
  },

  releaseResult
};
