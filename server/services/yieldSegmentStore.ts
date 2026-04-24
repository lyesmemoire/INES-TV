import { Geo, Segment, Device } from "./adBrain.service.js";

/* ============================================================
   YIELD SEGMENT STORE (Multi-Dimensional Control Plane)
============================================================ */

export type DimensionType = "geo" | "segment" | "device" | "qoe";

class YieldSegmentStore {
  private geoMult = new Map<string, number>();
  private segmentMult = new Map<string, number>();
  private deviceMult = new Map<string, number>();
  private qoeMult = new Map<string, number>();

  constructor() {
    this.reset();
  }

  /**
   * 🛡️ EMERGENCY RESET & SAFE BASELINE
   */
  reset() {
    this.geoMult.clear();
    this.segmentMult.clear();
    this.deviceMult.clear();
    this.qoeMult.clear();
    console.log("🔄 [YieldSegmentStore] Multipliers reset to baseline (1.0)");
  }

  getGeoMult(geo: Geo): number {
    return this.geoMult.get(geo) ?? 1.0;
  }

  getSegmentMult(segment: Segment): number {
    return this.segmentMult.get(segment) ?? 1.0;
  }

  getDeviceMult(device: Device): number {
    return this.deviceMult.get(device) ?? 1.0;
  }

  getQoeMult(bucket: number): number {
    return this.qoeMult.get(String(bucket)) ?? 1.0;
  }

  /**
   * Returns current multiplier for a specific dimension.
   */
  get(type: DimensionType, key: string): number {
    return this.getMapForType(type).get(key) ?? 1.0;
  }

  /**
   * ⚖️ SEGMENTED ADJUSTMENT
   * Applies a delta to a specific dimension key with safety clamping.
   */
  adjust(type: DimensionType, key: string, delta: number) {
    const map = this.getMapForType(type);
    const current = map.get(key) ?? 1.0;
    
    // Clamp individual dimension multiplier: 0.7 -> 1.5
    const next = Math.max(0.7, Math.min(1.5, current * (1 + delta)));
    map.set(key, next);
  }

  private getMapForType(type: DimensionType): Map<string, number> {
    switch (type) {
      case "geo": return this.geoMult;
      case "segment": return this.segmentMult;
      case "device": return this.deviceMult;
      case "qoe": return this.qoeMult;
    }
  }

  /**
   * Snapshot of all active multipliers for reporting.
   */
  snapshot() {
    return {
      geo: Object.fromEntries(this.geoMult),
      segment: Object.fromEntries(this.segmentMult),
      device: Object.fromEntries(this.deviceMult),
      qoe: Object.fromEntries(this.qoeMult)
    };
  }
}

export const yieldSegmentStore = new YieldSegmentStore();
