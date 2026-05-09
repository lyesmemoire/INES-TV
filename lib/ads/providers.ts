/**
 * 🏢 AD PROVIDERS REGISTRY
 */

export const AD_PROVIDERS = [
  'adsterra',
  'propeller',
  'exoclick',
  'hilltopads',
  'trafficstars',
  'clickadu'
] as const;

export type AdProviderName = typeof AD_PROVIDERS[number];

export interface ProviderConfig {
  id: AdProviderName;
  scriptUrl: string;
}

export const PROVIDER_CONFIGS: Record<AdProviderName, ProviderConfig> = {
  adsterra: { id: 'adsterra', scriptUrl: 'https://your-adsterra-script.js' },
  propeller: { id: 'propeller', scriptUrl: 'https://your-propeller-script.js' },
  exoclick: { id: 'exoclick', scriptUrl: 'https://your-exoclick-script.js' },
  hilltopads: { id: 'hilltopads', scriptUrl: 'https://your-hilltopads-script.js' },
  trafficstars: { id: 'trafficstars', scriptUrl: 'https://your-trafficstars-script.js' },
  clickadu: { id: 'clickadu', scriptUrl: 'https://your-clickadu-script.js' },
};
