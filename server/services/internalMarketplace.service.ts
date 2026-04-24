import { BidContext, Bidder } from './adBrain.service.js';

/* ============================================================
   1. TYPES & DATA
   ============================================================ */

export interface Campaign {
  id: string;
  name: string;
  cpm: number;
  totalBudget: number; // USD
  remainingBudget: number;
  geo: string[]; // e.g. ["DZ", "MA"]
  segments: string[]; // ["PREMIUM", "STANDARD"]
  pacingTargetRate: number; // USD / hour
  lastSpendWindow: number; // USD spent in last tick
  errorPrev: number;
  active: boolean;
}

const campaigns: Campaign[] = [
  {
    id: "cmp_dz_premium",
    name: "Algeria Premium Stream",
    cpm: 0.25,
    totalBudget: 100,
    remainingBudget: 100,
    geo: ["DZ"],
    segments: ["PREMIUM"],
    pacingTargetRate: 0.5, // 0.5 USD per hour
    lastSpendWindow: 0,
    errorPrev: 0,
    active: true
  },
  {
    id: "cmp_maghreb_standard",
    name: "Maghreb Generic Standard",
    cpm: 0.18,
    totalBudget: 250,
    remainingBudget: 250,
    geo: ["DZ", "MA", "TN"],
    segments: ["STANDARD"],
    pacingTargetRate: 1.2,
    lastSpendWindow: 0,
    errorPrev: 0,
    active: true
  },
  {
    id: "cmp_global_fallback",
    name: "Global House Ad",
    cpm: 0.05,
    totalBudget: 10000,
    remainingBudget: 10000,
    geo: ["DZ", "MA", "TN", "OTHER"],
    segments: ["LOW", "STANDARD"],
    pacingTargetRate: 5.0,
    lastSpendWindow: 0,
    errorPrev: 0,
    active: true
  }
];

// Safety lock for budget consumption
const consumptionLock = new Set<string>();

/* ============================================================
   2. CORE SERVICE
   ============================================================ */

export const InternalMarketplace = {
  /**
   * 🎯 GENERATE BIDDERS (Eligibility + Pacing + Scoring)
   */
  getBidders(ctx: BidContext): Bidder[] {
    const activeMatches = campaigns.filter(c => 
      c.active && 
      c.remainingBudget > 0 &&
      c.geo.includes(ctx.geo || "MA") &&
      c.segments.includes(ctx.segment || "STANDARD")
    );

    return activeMatches.map(c => {
      // 1. Stable Pacing Multiplier (PI-inspired clamp)
      // targetRate is converted to per-second (simplified)
      const targetPerSec = c.pacingTargetRate / 3600;
      const actualPerSec = c.lastSpendWindow || 0; // In a real system, use an EMA of spend
      
      const error = actualPerSec > 0 ? (actualPerSec / targetPerSec) - 1 : -0.2;
      const pacingMultiplier = Math.max(0.5, Math.min(1.2, 1 - 0.5 * error));

      // 2. Deterministic Quality Signal
      const viewability = (ctx.device || "DESKTOP") === "DESKTOP" ? 0.9 : 0.7;
      const qualityBase = (0.6 + 0.4 * (ctx.qoeScore || 1.0));
      const quality = qualityBase * viewability;

      // 3. Final Economic Bid (What advertiser pays / Clearing base)
      // Note: AdBrain will further adjust this by qoe in its internal loop
      const adjustedCpm = c.cpm * pacingMultiplier;

      return {
        id: c.id,
        baseEcpm: adjustedCpm, // Mapped to Bidder interface
        reliability: Number(quality.toFixed(4)),
        avgLatency: 5 // Low latency for internal campaigns
      };
    });
  },

  /**
   * 💰 COMMIT BUDGET (Thread-safe consumption)
   */
  async consumeBudget(campaignId: string, price: number) {
    if (consumptionLock.has(campaignId)) return;
    consumptionLock.add(campaignId);

    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      const usdCost = price / 1000; // CPM to USD
      
      if (campaign.remainingBudget < usdCost) {
        campaign.active = false;
        campaign.remainingBudget = 0;
      } else {
        campaign.remainingBudget -= usdCost;
        campaign.lastSpendWindow = usdCost; // Simplified for MVP pacing
      }

      if (campaign.remainingBudget <= 0) {
        campaign.active = false;
      }

      console.log(`[Marketplace] 💸 Consumed $${usdCost.toFixed(6)} for ${campaign.id}. Remaining: $${campaign.remainingBudget.toFixed(2)}`);

    } finally {
      consumptionLock.delete(campaignId);
    }
  },

  /**
   * 📈 RESET SPEND WINDOWS (Periodic)
   */
  resetSpendWindows() {
    campaigns.forEach(c => {
      c.lastSpendWindow = 0;
    });
  }
};

// Reset spend tracking every 5s to allow pacing to breathe
setInterval(() => InternalMarketplace.resetSpendWindows(), 5000);
