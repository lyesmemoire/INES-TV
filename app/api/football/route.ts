/**
 * @route GET /api/football
 * @description Route Handler exposant les données football aux clients externes
 * (applications mobiles, widgets tiers, appels côté navigateur).
 * 
 * La logique métier est déléguée à footballService.ts — aucune duplication.
 * La Homepage Next.js appelle directement le service sans passer par cette route.
 */

import { NextResponse } from 'next/server'
import { fetchLiveMatches } from '@/src/lib/footballService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchLiveMatches({ revalidate: 30 })

    return NextResponse.json(data, {
      headers: {
        // Cache CDN : 30s, stale-while-revalidate pour zéro downtime
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Data-Source': data.source,
        'X-Fetched-At': data.fetchedAt,
      },
    })
  } catch (error) {
    console.error('[/api/football] Fetch error:', error)

    return NextResponse.json(
      {
        error: 'Impossible de récupérer les matchs en direct',
        matches: [],
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': '30',
        },
      }
    )
  }
}
