export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { logClick } from '@/lib/ads/service';

/**
 * 🖱️ AD CLICK TRACKER
 * Logs clicks for RPM and CTR calculations.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const providerId = searchParams.get('providerId');
  const country = searchParams.get('country') || 'unknown';
  const device = searchParams.get('device') || 'unknown';

  if (!providerId) {
    return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });
  }

  try {
    await logClick(providerId, country, device);
    
    // Most providers handle their own redirects, 
    // but we log the event for our internal "Ad Exchange" brain.
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// Support POST as well if needed
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, country, device } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });
    }

    await logClick(providerId, country || 'unknown', device || 'unknown');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
