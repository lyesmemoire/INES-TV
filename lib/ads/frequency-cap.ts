/**
 * 🔒 FREQUENCY CAP (24H SLIDING WINDOW)
 * Manages impressions per ad provider with configurable limits.
 */

interface ImpressionData {
  timestamps: number[];
}

const DAY = 24 * 60 * 60 * 1000;

export class FrequencyCap {
  private provider: string;
  private limit: number;

  constructor(provider: string, limit: number = 1) {
    this.provider = provider;
    this.limit = limit;
  }

  private getStorageKey() {
    return `itv_ad_impression_v2_${this.provider}`;
  }

  /**
   * Checks if a new ad from this provider can be shown.
   */
  canShow(): boolean {
    if (typeof window === 'undefined') return false;
    
    const raw = localStorage.getItem(this.getStorageKey());
    if (!raw) return true;

    try {
      const data: ImpressionData = JSON.parse(raw);
      const now = Date.now();
      
      // Filter out timestamps older than 24h
      const recentImpressions = data.timestamps.filter(ts => now - ts < DAY);
      
      return recentImpressions.length < this.limit;
    } catch (err) {
      return true;
    }
  }

  /**
   * Registers a successful impression for this provider.
   */
  register() {
    if (typeof window === 'undefined') return;
    
    const raw = localStorage.getItem(this.getStorageKey());
    let timestamps: number[] = [];

    if (raw) {
      try {
        const data: ImpressionData = JSON.parse(raw);
        const now = Date.now();
        timestamps = data.timestamps.filter(ts => now - ts < DAY);
      } catch (e) {
        timestamps = [];
      }
    }

    timestamps.push(Date.now());

    const data: ImpressionData = {
      timestamps
    };

    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  }
}
