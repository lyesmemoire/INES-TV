import { yieldSegmentStore } from "./yieldSegmentStore.js";
import { BidContext } from "./adBrain.service.js";

export const YIELD_CONTROL_CONFIG = {
  // ... existing config unchanged or moved to Store ...
  safeBase: 1.0,
};

export class YieldControlEngine {
  private static shadingAggressiveness = 1.0;

  /**
   * 🧠 MULTI-DIMENSIONAL COMPOUNDING
   * Aggregates multipliers from Geo, Segment, Device, and QoE.
   */
  static getDynamicMultiplier(ctx: BidContext): number {
    const qoeScore = ctx.qoeScore ?? 1.0;
    const qoeBucket = Math.floor(qoeScore * 10);
    
    // Compounded logic
    const rawMult = (
      yieldSegmentStore.getGeoMult(ctx.geo || "MA") *
      yieldSegmentStore.getSegmentMult(ctx.segment || "STANDARD") *
      yieldSegmentStore.getDeviceMult(ctx.device || "DESKTOP") *
      yieldSegmentStore.getQoeMult(qoeBucket)
    );

    // 🛡️ ANTI-EXPLOSION CLAMP (AdTech Production Standard)
    return Math.max(0.6, Math.min(1.8, rawMult));
  }
  static getShadingAggressiveness() { return this.shadingAggressiveness; }

  /**
   * Adjusts how aggressively we shade bids based on competition density.
   */
  static adjustShading(delta: number) {
    this.shadingAggressiveness = Math.max(
      0.1,
      Math.min(2.0, this.shadingAggressiveness + delta)
    );
  }

  /**
   * 🛡️ SAFE MODE ROLLBACK
   * Returns system to established safe baseline in case of instability.
   */
  static rollback() {
    console.warn("🛡️ [YieldControl] !! EMERGENCY ROLLBACK !!");
    yieldSegmentStore.reset();
    this.shadingAggressiveness = 1.0;
  }
}
