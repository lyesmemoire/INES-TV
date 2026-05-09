/**
 * 🌍 GEO TIERING
 * Adapts ad aggressiveness based on country RPM.
 */

export type CountryTier = 'tier1' | 'tier2' | 'tier3';

/**
 * Categorizes a country code into a Tier for ad strategies.
 * Tier 1: High RPM (Strict/Clean)
 * Tier 2: Medium RPM (Balanced)
 * Tier 3: Low RPM (More Aggressive)
 */
export const getCountryTier = (countryCode: string = 'US'): CountryTier => {
  const tier1 = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'CH', 'BE', 'NL', 'SE', 'NO', 'DK'];
  const tier2 = ['ES', 'IT', 'BR', 'MX', 'AR', 'CL', 'PL', 'PT', 'TR', 'RU'];
  
  const code = countryCode.toUpperCase();
  
  if (tier1.includes(code)) return 'tier1';
  if (tier2.includes(code)) return 'tier2';
  return 'tier3';
};
