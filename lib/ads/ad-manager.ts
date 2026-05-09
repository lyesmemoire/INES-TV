import { FrequencyCap } from './frequency-cap';
import { getActiveProviders, logImpression, AdProvider } from './service';
import { getCountryTier } from './geo';
import { calculateScore } from './optimizer';

export class GlobalAdManager {
  private country: string;
  private device: string;
  private os: string;

  constructor(country: string = 'US', device: string = 'desktop', os: string = 'unknown') {
    this.country = country;
    this.device = device;
    
    // Auto-detect OS if unknown and in browser
    if (os === 'unknown' && typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) os = 'android';
      else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
      else if (/windows/i.test(ua)) os = 'windows';
      else if (/macintosh/i.test(ua)) os = 'mac';
      else if (/linux/i.test(ua)) os = 'linux';
    }
    
    this.os = os;
  }

  /**
   * Returns a list of ad providers that are eligible for an impression 
   * based on the user's country and their specific frequency caps from DB.
   * Providers are sorted by performance score.
   */
  async getEligibleProviders(): Promise<AdProvider[]> {
    const tier = getCountryTier(this.country);

    // Limit the number of total providers we can show per session based on Tier
    let maxProvidersPerSession = 1;
    if (tier === 'tier2') maxProvidersPerSession = 2;
    if (tier === 'tier3') maxProvidersPerSession = 3;

    // Fetch active and targeted providers from Supabase
    const allProviders = await getActiveProviders(this.country, this.device);
    
    // 1. Filter by Frequency Cap
    const filterByCap = allProviders.filter(provider => {
      const cap = new FrequencyCap(provider.id, provider.max_per_24h);
      return cap.canShow();
    });

    // 2. Score and Sort
    const scored = filterByCap.map(provider => ({
      provider,
      score: calculateScore({
        rpm: provider.rpm || 0,
        ctr: provider.ctr || 0,
        stability: provider.stability_score || 100,
        priorityBoost: provider.priority_boost || 0,
        qualityScore: provider.quality_score || 100
      })
    }));

    scored.sort((a, b) => b.score - a.score);

    // 🚀 3. Controlled Exploration (Multi-Armed Bandit)
    // 15% of the time, we pick a random eligible provider to gather fresh data
    const explorationRate = 0.15;
    if (Math.random() < explorationRate && filterByCap.length > 1) {
      console.log('[AdManager] 🎲 Exploration Mode: picking random provider');
      const randomIndex = Math.floor(Math.random() * filterByCap.length);
      return [filterByCap[randomIndex]];
    }

    // 4. Take Top N (Exploitation Mode)
    return scored.slice(0, maxProvidersPerSession).map(s => s.provider);
  }

  /**
   * Marks an impression as successful for a specific provider.
   */
  async registerImpression(provider: AdProvider) {
    const cap = new FrequencyCap(provider.id, provider.max_per_24h);
    cap.register();
    
    // Log to DB for RPM tracking (Fire and forget or wait)
    logImpression(provider.id, this.country, this.device).catch(err => 
      console.error('[AdManager] DB Logging failed:', err)
    );
  }
}
