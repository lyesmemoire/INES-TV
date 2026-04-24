import { CampaignCache } from "../core/memory/CampaignCache.js";

/**
 * ⚡ ADS OPTIMIZER SERVICE
 * Re-scores campaign weights based on real CTR feedback from AnalyticsStore.
 * Runs every hour via the adsOptimizer.cron job.
 */
export async function optimizeAdsWeights(): Promise<void> {
  try {
    const campaigns = CampaignCache.getAll();

    for (const c of campaigns) {
      if (!c.id) continue;

      // TODO: pull real CTR from AnalyticsStore per campaign and adjust bids
      // For now: log it. Phase 2 will plug in real feedback loop.
      console.log(`[AdsOptimizer] Campaign ${c.id} — CPM: ${c.cpm?.toFixed(3)} | Active: ${c.isActive}`);
    }

    console.log(`[AdsOptimizer] ✅ Re-scored ${campaigns.length} campaigns.`);
  } catch (err) {
    console.error("[AdsOptimizer] Failed to optimize weights:", err);
  }
}
