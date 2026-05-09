export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 🔄 AUTONOMOUS METRICS ENGINE (V2: Temporal Decay)
 * Recalculates real RPM and CTR from raw logs with Time-Decay weighting.
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Get all impressions with timestamps
    const { data: impressions, error: impError } = await supabase
      .from('ad_impressions')
      .select('provider_id, revenue, created_at');

    if (impError) throw impError;

    // 2. Get all clicks with timestamps
    const { data: clicks, error: clickError } = await supabase
      .from('ad_clicks')
      .select('provider_id, created_at');

    if (clickError) throw clickError;

    // 3. Process data with weights
    const stats: Record<string, { imp: number; clk: number; rev: number }> = {};

    const getWeight = (createdAt: string) => {
      const date = new Date(createdAt);
      if (date > sevenDaysAgo) return 1.0;
      if (date > fourteenDaysAgo) return 0.5;
      return 0.2;
    };

    impressions?.forEach((i: any) => {
      if (!stats[i.provider_id]) stats[i.provider_id] = { imp: 0, clk: 0, rev: 0 };
      const w = getWeight(i.created_at);
      stats[i.provider_id].imp += w;
      stats[i.provider_id].rev += parseFloat(i.revenue || 0) * w;
    });

    clicks?.forEach((c: any) => {
      if (!stats[c.provider_id]) stats[c.provider_id] = { imp: 0, clk: 0, rev: 0 };
      const w = getWeight(c.created_at);
      stats[c.provider_id].clk += w;
    });

    // 4. Update providers in the DB
    const updates = Object.entries(stats).map(async ([id, s]) => {
      const computed_ctr = s.imp > 0 ? s.clk / s.imp : 0;
      const computed_rpm = s.imp > 0 ? (s.rev / s.imp) * 1000 : 0;

      // Update with weighted metrics
      return supabase
        .from('ad_providers')
        .update({
          rpm: computed_rpm,
          ctr: computed_ctr
        })
        .eq('id', id);
    });

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      processed: Object.keys(stats).length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[AdOptimizer] Engine failure:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
