import { GEO_MAP, getGeoIndex, GeoIndex } from "./GeoConstants";

export type Campaign = {
  id: string;
  name: string;
  cpm: number;
  budget: number;
  spent: number;
  geo: string;
  segment: string;
  isActive: boolean;
};

/**
 * ⚡ GOOGLE-GRADE CAMPAIGN CACHE (Struct of Arrays)
 * Minimizes pointer chasing and maximizes CPU prefetching.
 */
export class CampaignCache {
  private static readonly MAX_CAMPAIGNS = 2000;
  
  // SHARED MEMORY LAYOUT (Google-Grade Zero-Copy)
  private static bidsBuf = new SharedArrayBuffer(CampaignCache.MAX_CAMPAIGNS * 8);
  private static qualitiesBuf = new SharedArrayBuffer(CampaignCache.MAX_CAMPAIGNS * 8);
  private static geoIndicesBuf = new SharedArrayBuffer(CampaignCache.MAX_CAMPAIGNS * 1);
  private static activeFlagsBuf = new SharedArrayBuffer(CampaignCache.MAX_CAMPAIGNS * 1);

  private static bids = new Float64Array(CampaignCache.bidsBuf);
  private static qualities = new Float64Array(CampaignCache.qualitiesBuf);
  private static geoIndices = new Uint8Array(CampaignCache.geoIndicesBuf);
  private static activeFlags = new Uint8Array(CampaignCache.activeFlagsBuf);

  static setBuffers(bufs: { bids: SharedArrayBuffer, qualities: SharedArrayBuffer, geo: SharedArrayBuffer, active: SharedArrayBuffer, meta: SharedArrayBuffer }) {
    this.bidsBuf = bufs.bids;
    this.qualitiesBuf = bufs.qualities;
    this.geoIndicesBuf = bufs.geo;
    this.activeFlagsBuf = bufs.active;
    this.metaBuf = bufs.meta;

    this.bids = new Float64Array(this.bidsBuf);
    this.qualities = new Float64Array(this.qualitiesBuf);
    this.geoIndices = new Uint8Array(this.geoIndicesBuf);
    this.activeFlags = new Uint8Array(this.activeFlagsBuf);
    this.meta = new Uint32Array(this.metaBuf);
  }
  
  // SHARED METADATA (Cross-process sync)
  private static metaBuf = new SharedArrayBuffer(8); // [0]: nextSlot (Uint32)
  private static meta = new Uint32Array(this.metaBuf);
  
  // METADATA (Process-local maps)
  private static campaignIds = new Array<string>(CampaignCache.MAX_CAMPAIGNS);
  private static idToIndex = new Map<string, number>();
  private static geoToIndexList = new Map<number, number[]>();

  static set(c: Campaign) {
    let idx = this.idToIndex.get(c.id);
    
    if (idx === undefined) {
      idx = Atomics.add(this.meta, 0, 1);
      this.idToIndex.set(c.id, idx);
    }

    this.campaignIds[idx] = c.id;
    this.bids[idx] = c.cpm;
    this.qualities[idx] = 1.0; // Default quality
    this.geoIndices[idx] = getGeoIndex(c.geo);
    this.activeFlags[idx] = (c.isActive && c.spent < c.budget) ? 1 : 0;

    this.rebuildGeoIndex();
  }

  static get(id: string): any {
    const idx = this.idToIndex.get(id);
    if (idx === undefined) return null;
    return {
      id: this.campaignIds[idx],
      cpm: this.bids[idx],
      geoIndex: this.geoIndices[idx],
      isActive: this.activeFlags[idx] === 1
    };
  }

  /**
   * 🎯 O(1) NUMERIC LOOKUP
   * Returns indices into the SoA arrays.
   */
  static getIndicesByGeo(geoIdx: number): number[] {
    return this.geoToIndexList.get(geoIdx) || [];
  }

  static getRawData() {
    return {
      bids: this.bids,
      qualities: this.qualities,
      geoIndices: this.geoIndices,
      activeFlags: this.activeFlags,
      campaignIds: this.campaignIds
    };
  }

  private static rebuildGeoIndex() {
    const newIndex = new Map<number, number[]>();
    const count = Atomics.load(this.meta, 0);

    for (let i = 0; i < count; i++) {
      if (this.activeFlags[i] === 0) continue;
      
      const g = this.geoIndices[i];
      if (!newIndex.has(g)) newIndex.set(g, []);
      newIndex.get(g)!.push(i);
    }

    // 🏎️ L1 HOT TIER OPTIMIZATION: Sort by bid in descending order
    // This ensures the Ultra Kernel loop hits high-value campaigns first.
    for (const [_, indices] of newIndex) {
      indices.sort((a, b) => this.bids[b] - this.bids[a]);
    }
    
    this.geoToIndexList = newIndex;
  }

  static addSpend(id: string, amount: number) {
    // In a real high-perf system, budget/spend would also be in a Float64Array
    // Simplified for now: just toggle active flag if budget logic was complex
    const idx = this.idToIndex.get(id);
    if (idx !== undefined) {
      // Logic for budget depletion normally goes here
      // For now we just keep the SoA updated
    }
  }

  static getAll(): any[] {
    const count = Atomics.load(this.meta, 0);
    const results: any[] = [];
    for (let i = 0; i < count; i++) {
        results.push({
            id: this.campaignIds[i],
            cpm: this.bids[i],
            geoIndex: this.geoIndices[i],
            isActive: this.activeFlags[i] === 1
        });
    }
    return results;
  }

  static toggleStatus(id: string) {
    const idx = this.idToIndex.get(id);
    if (idx !== undefined) {
      this.activeFlags[idx] = this.activeFlags[idx] === 1 ? 0 : 1;
      this.rebuildGeoIndex();
      return this.get(id);
    }
    return null;
  }

  static delete(id: string) {
    const idx = this.idToIndex.get(id);
    if (idx !== undefined) {
      this.activeFlags[idx] = 0;
      this.rebuildGeoIndex();
    }
  }
}
