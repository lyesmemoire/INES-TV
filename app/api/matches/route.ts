export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { fetchLiveMatches } from '@/src/lib/footballService'

/**
 * 📡 API ROUTE: /api/matches
 * Utilisée pour le polling des scores en direct côté client.
 * Bénéficie du cache global singleton implémenté dans footballService.
 */
export async function GET() {
  try {
    const data = await fetchLiveMatches({ revalidate: 15 })
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('[API Matches] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}
