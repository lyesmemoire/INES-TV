import { GEO_MAP, getGeoIndex, GeoIndex } from "./GeoConstants";

/**
 * ⚡ BIT-PACKED ANALYTICS (Google-Grade)
 * Packs an entire event into a single 32-bit integer.
 * Memory: 4 bytes per event vs ~80-120 per object.
 */
export class AnalyticsStore {
  private static readonly MAX_EVENTS = 100_000; // Expanded since bit-packing is lean
  
  // SHARED MEMORY READY
  private events = new Uint32Array(AnalyticsStore.MAX_EVENTS);
  private index = 0;

  // SHARED MEMORY COUNTERS (Cluster-safe)
  private static countersBuf: SharedArrayBuffer = new SharedArrayBuffer(10 * 8); 
  private static computedBuf: SharedArrayBuffer = new SharedArrayBuffer(10 * 8); // [0]: RPM, [1]: FillRate, [2]: CTR, [3]: Health
  private static dataView = new BigInt64Array(AnalyticsStore.countersBuf);
  private static computedView = new Float64Array(AnalyticsStore.computedBuf);
  
  static setBuffer(buf: SharedArrayBuffer, computed?: SharedArrayBuffer) {
    this.countersBuf = buf;
    this.dataView = new BigInt64Array(buf);
    if (computed) {
      this.computedBuf = computed;
      this.computedView = new Float64Array(computed);
    }
  }

  static updateComputedStats(index: number, value: number) {
    this.computedView[index] = value;
  }

  static recordBlocked() {
    Atomics.add(AnalyticsStore.dataView, 5, 1n);
  }
  
  // Indices: 0:requests, 1:impressions, 2:clicks, 3:revenue, 4:fallbacks, 5:blocked
  private readonly REQ_IDX = 0;
  private readonly IMP_IDX = 1;
  private readonly CLK_IDX = 2;
  private readonly REV_IDX = 3;
  private readonly FBK_IDX = 4;
  private readonly BLK_IDX = 5;

  // 📈 Campaign Performance Store (SoA)
  private cmpImpressions = new Uint32Array(2000);
  private cmpClicks = new Uint32Array(2000);

  // 💰 Revenue Windowing (for rpmTrend)
  private revCurrent5m = 0;
  private revPrev5m = 0;

  constructor() {
    setInterval(() => {
        this.revPrev5m = this.revCurrent5m;
        this.revCurrent5m = 0;
    }, 5 * 60 * 1000);
  }

  add(geoStr: string, type: "request" | "impression" | "click", campaignIdx: number, revenue: number) {
    const geoIdx = getGeoIndex(geoStr);
    
    if (type === "request") {
        Atomics.add(AnalyticsStore.dataView, this.REQ_IDX, 1n);
        return;
    }

    const typeBit = type === "click" ? 1 : 0;
    
    // PACK: [0-7: Geo] [8: Type] [9-24: CampaignIdx] [25-31: Reserved]
    const packed = (geoIdx & 0xFF) | (typeBit << 8) | (campaignIdx << 9);
    
    this.events[this.index++] = packed;
    if (this.index >= AnalyticsStore.MAX_EVENTS) this.index = 0;

    // Fast counters (Worker-local for Campaign CTR tracking to avoid lock contention)
    if (typeBit === 0) {
      Atomics.add(AnalyticsStore.dataView, this.IMP_IDX, 1n);
      if (campaignIdx < 2000) this.cmpImpressions[campaignIdx]++;
    } else {
      Atomics.add(AnalyticsStore.dataView, this.CLK_IDX, 1n);
      if (campaignIdx < 2000) this.cmpClicks[campaignIdx]++;
    }

    // Revenue is floating point, Atomics only supports Int. 
    // We store as 'scaled' BigInt in REV_IDX.
    this.revCurrent5m += revenue;
  }

  recordImpression(price: number) {
    const scaledPrice = BigInt(Math.floor(price * 1_000_000));
    Atomics.add(AnalyticsStore.dataView, this.REV_IDX, scaledPrice);
    Atomics.add(AnalyticsStore.dataView, this.IMP_IDX, 1n);
  }

  recordClick() {
    Atomics.add(AnalyticsStore.dataView, this.CLK_IDX, 1n);
  }

  recordBlocked() {
    Atomics.add(AnalyticsStore.dataView, this.BLK_IDX, 1n);
  }

  recordFallback() {
    Atomics.add(AnalyticsStore.dataView, this.FBK_IDX, 1n);
  }

  getStats() {
    const c = AnalyticsStore.dataView;
    const comp = AnalyticsStore.computedView;

    const reqs = Number(c[this.REQ_IDX]);
    const imps = Number(c[this.IMP_IDX]);
    const clks = Number(c[this.CLK_IDX]);
    const fbk = Number(c[this.FBK_IDX]);
    const blocked = Number(c[this.BLK_IDX]);
    const revScaled = Number(c[this.REV_IDX]);

    const revenue = revScaled / 1_000_000;
    
    // Computed values are read from the shared computedView (updated by background worker)
    const rpm = comp[0] || (imps > 0 ? (revenue / imps) * 1000 : 5.0);
    const fillRate = comp[1] || (reqs === 0 ? 0 : imps / reqs);
    const ctr = comp[2] || (imps ? clks / imps : 0);

    return {
      requests: reqs,
      impressions: imps,
      clicks: clks,
      revenue: Number(revenue.toFixed(4)),
      rpm: Number(rpm.toFixed(2)),
      fillRate,
      fallbacks: fbk,
      blocked,
      ctr,
      health: comp[3] || 1.0 // Cache Health Metric
    };
  }

  /**
   * 🎯 CTR SCORE PER CAMPAIGN
   * Returns a multiplier based on historical performance.
   */
  getCampaignCTRBoost(idx: number): number {
    if (idx >= 2000) return 1.0;
    const imps = this.cmpImpressions[idx];
    if (imps < 100) return 1.0; // Wait for significant data
    const ctr = this.cmpClicks[idx] / imps;
    return 1.0 + (ctr * 10); // Boost by up to 10% for high CTR (1%)
  }

  // Helper to unpack a specific event
  private unpack(packed: number) {
    return {
      geoIdx: packed & 0xFF,
      isClick: (packed >> 8) & 1,
      campaignIdx: (packed >> 9) & 0xFFFF
    };
  }
}

export const analyticsStore = new AnalyticsStore();
