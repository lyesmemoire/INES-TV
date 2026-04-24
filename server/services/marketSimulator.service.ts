import { Bidder } from "./adBrain.service.js";

/* ============================================================
   MARKET SIMULATOR (realistic RTB dynamics)
============================================================ */

export const MARKET_CONFIG = {
  basePressure: 1.0,
  jitterSeverity: 0.1, // 10% variability in performance
};

export class MarketSimulator {
  private static marketPressureIndex = 1.0; // 0.5 (low demand) -> 2.0+ (high demand)

  /**
   * Modulates the global market pressure.
   * High pressure = Bidders are willing to pay more but may have higher latency spikes.
   */
  static setMarketPressure(val: number) {
    this.marketPressureIndex = Math.max(0.1, Math.min(5.0, val));
  }

  static getPressureIndex() {
    return this.marketPressureIndex;
  }

  /**
   * Generates a dynamic set of bidders mirroring real-world fluctuation.
   */
  static getBidders(contextMultiplier = 1.0): Bidder[] {
    const p = this.marketPressureIndex * contextMultiplier;
    
    return [
      {
        id: "internal_prime",
        baseEcpm: 1.25 * p,
        reliability: Math.max(0.6, 0.98 - (Math.random() * MARKET_CONFIG.jitterSeverity * p)),
        avgLatency: 8 + (Math.random() * 5 * p)
      },
      {
        id: "partner_beta",
        baseEcpm: 0.95 * p,
        reliability: Math.max(0.5, 0.85 - (Math.random() * MARKET_CONFIG.jitterSeverity * p)),
        avgLatency: 22 + (Math.random() * 12 * p)
      },
      {
        id: "house_fallback",
        baseEcpm: 0.5 * p,
        reliability: 1.0,
        avgLatency: 4 + (Math.random() * 3)
      }
    ];
  }
}
