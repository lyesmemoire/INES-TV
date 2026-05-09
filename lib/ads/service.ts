/**
 * 📢 ADS DATABASE SERVICE
 * Data access layer for ad providers and impression tracking.
 */

import { supabase } from '../supabase';

export interface AdProvider {
  id: string;
  name: string;
  script_url: string;
  format: string;
  active: boolean;
  max_per_24h: number;
  allowed_countries: string[] | null;
  device: string;
  
  // Performance Metrics
  rpm: number;
  ctr: number;
  stability_score: number;
  priority_boost: number;
  quality_score: number;
}

export async function getActiveProviders(country: string, device: string): Promise<AdProvider[]> {
  try {
    const { data, error } = await supabase
      .from('ad_providers')
      .select('*')
      .eq('active', true)
      .gte('quality_score', 50); // Stability Filter: skip low quality providers

    if (error) {
      console.error('[AdsService] Error fetching providers:', error);
      return [];
    }

    return (data as AdProvider[]).filter(provider => {
      // Check Country Targeting
      const countryAllowed = 
        !provider.allowed_countries || 
        provider.allowed_countries.length === 0 || 
        provider.allowed_countries.includes(country);

      // Check Device Targeting
      const deviceAllowed = 
        provider.device === 'both' || 
        provider.device === device;

      return countryAllowed && deviceAllowed;
    });
  } catch (err) {
    console.error('[AdsService] Unexpected error fetching providers:', err);
    return [];
  }
}

export async function logImpression(providerId: string, country: string, device: string, os: string = 'unknown', revenue: number = 0) {
  const hour = new Date().getHours();
  const { error } = await supabase
    .from('ad_impressions')
    .insert({
      provider_id: providerId,
      country,
      device,
      os,
      hour,
      revenue
    });

  if (error) {
    console.error('[AdsService] Error logging impression:', error);
  }
}

export async function logClick(providerId: string, country: string, device: string, os: string = 'unknown') {
  const hour = new Date().getHours();
  const { error } = await supabase
    .from('ad_clicks')
    .insert({
      provider_id: providerId,
      country,
      device,
      os,
      hour
    });

  if (error) {
    console.error('[AdsService] Error logging click:', error);
  }
}

/**
 * 🔒 SECURITY & VALIDATION
 */

const AD_SCRIPT_REGEX = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;

export function validateAdScript(url: string): boolean {
  return AD_SCRIPT_REGEX.test(url);
}

export async function logAuditAction(action: string, providerId?: string, changes?: any) {
  const { error } = await supabase
    .from('ad_audit_logs')
    .insert({
      action,
      provider_id: providerId,
      changes
    });

  if (error) {
    console.error('[AdsService] Audit logging failed:', error);
  }
}
