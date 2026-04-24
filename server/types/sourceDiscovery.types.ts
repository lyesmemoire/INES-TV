/**
 * 📡 SOURCE DISCOVERY TYPE DEFINITIONS (Phase 95)
 */

export interface ScrapedSource {
  url: string;
  sourceName: string; // Name of the scraper site
  detectedAt: number;
  channelId?: string;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  interval: number; // in minutes
  enabled: boolean;
}

export interface DiscoveryReport {
  scanned: number;
  found: number;
  valid: number;
  duration: number;
}
