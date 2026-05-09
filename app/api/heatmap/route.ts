export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔥 HEATMAP API ROUTE
 * Captures user click data for optimization.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 🔍 In production, you would store this in Supabase:
    // const { error } = await supabase.from('heatmaps').insert([body]);
    
    console.log('[Heatmap] Data Received:', body);

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('[Heatmap] Error processing data', err);
    return new NextResponse('Error', { status: 500 });
  }
}
