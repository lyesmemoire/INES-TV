export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 📊 GLOBAL REVENUE DASHBOARD API
 * Aggregates performance data by country, device, and OS.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Get stats grouped by provider, country, device, os
    // Note: In a real production app, you'd use a dedicated aggregation table or a complex SQL view.
    // For this industrial prototype, we aggregate raw logs.
    
    const { data: stats, error } = await supabase
      .from('ad_impressions')
      .select('provider_id, country, device, os, revenue');

    if (error) throw error;

    const aggregation: any = {
      byCountry: {},
      byDevice: {},
      byOS: {},
      byProvider: {}
    };

    stats?.forEach((s: any) => {
      const rev = parseFloat(s.revenue || 0);
      
      // Group by Country
      if (!aggregation.byCountry[s.country]) aggregation.byCountry[s.country] = { imp: 0, rev: 0 };
      aggregation.byCountry[s.country].imp++;
      aggregation.byCountry[s.country].rev += rev;

      // Group by Device
      if (!aggregation.byDevice[s.device]) aggregation.byDevice[s.device] = { imp: 0, rev: 0 };
      aggregation.byDevice[s.device].imp++;
      aggregation.byDevice[s.device].rev += rev;

      // Group by OS
      if (!aggregation.byOS[s.os]) aggregation.byOS[s.os] = { imp: 0, rev: 0 };
      aggregation.byOS[s.os].imp++;
      aggregation.byOS[s.os].rev += rev;

      // Group by Provider
      if (!aggregation.byProvider[s.provider_id]) aggregation.byProvider[s.provider_id] = { imp: 0, rev: 0 };
      aggregation.byProvider[s.provider_id].imp++;
      aggregation.byProvider[s.provider_id].rev += rev;
    });

    // Calculate RPMs
    const calculateRPM = (obj: any) => {
      Object.keys(obj).forEach(key => {
        obj[key].rpm = obj[key].imp > 0 ? (obj[key].rev / obj[key].imp) * 1000 : 0;
      });
    };

    calculateRPM(aggregation.byCountry);
    calculateRPM(aggregation.byDevice);
    calculateRPM(aggregation.byOS);
    calculateRPM(aggregation.byProvider);

    return NextResponse.json({
      success: true,
      data: aggregation,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
