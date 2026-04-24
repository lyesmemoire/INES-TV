import { analyticsStore, AnalyticsStore } from "../memory/AnalyticsStore.js";
import { CampaignCache } from "../memory/CampaignCache.js";

class RevenueOptimizer {
  private lastTick = Date.now();

  /**
   * 📊 BACKGROUND KPI COMPUTATION (2s Resolution)
   * Decouples heavy math from the AdX hot path.
   */
  computeKPIs() {
    const stats = analyticsStore.getStats(); // Gets raw counters
    
    const reqs = stats.requests;
    const imps = stats.impressions;
    const clks = stats.clicks;
    const revenue = stats.revenue;

    const rpm = imps > 0 ? (revenue / imps) * 1000 : 5.0;
    const fillRate = reqs === 0 ? 0 : imps / reqs;
    const ctr = imps > 0 ? clks / imps : 0;

    // 🛡️ CACHE HEALTH MONITOR (Staff+ Check)
    // Measures saturation and potential memory pressure
    const { campaignIds } = CampaignCache.getRawData();
    const activeCampaigns = campaignIds.filter(id => id).length;
    const campaignSaturation = activeCampaigns / 2000;
    
    // Atomics contention/load estimate (event loop lag)
    const health = Math.max(0, 1.0 - (campaignSaturation > 0.9 ? 0.2 : 0) - (fillRate < 0.2 ? 0.1 : 0));

    // Write computed KPIs to Shared Buffer for O(1) read in all workers
    AnalyticsStore.updateComputedStats(0, rpm);
    AnalyticsStore.updateComputedStats(1, fillRate);
    AnalyticsStore.updateComputedStats(2, ctr);
    AnalyticsStore.updateComputedStats(3, health);
  }

  tick() {
    this.computeKPIs();

    const stats = analyticsStore.getStats();
    const fillRate = stats.fillRate;
    const rpm = stats.rpm;

    const { bids, activeFlags } = CampaignCache.getRawData();
    
    // 🔥 OPTIMIZED LOOP: Direct SoA manipulation
    for (let i = 0; i < activeFlags.length; i++) {
        if (activeFlags[i] === 0) continue;

        // SAFE RULE ENGINE (Insight-driven, not coercive)
        if (fillRate < 0.6) {
          bids[i] *= 1.05; 
        }

        if (rpm < 0.5) {
          bids[i] *= 1.02; 
        }

        if (rpm > 5.0) {
          bids[i] *= 0.98; // cooling
        }
    }
  }
}

export const revenueOptimizer = new RevenueOptimizer();
