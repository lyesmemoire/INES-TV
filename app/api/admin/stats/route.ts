export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 📊 API: /api/admin/stats
 * Fournit les métriques globales pour le Dashboard Admin.
 */
export async function GET() {
  try {
    const [streams, liveMatches] = await Promise.all([
      prisma.stream.findMany(),
      prisma.channel.count({ where: { status: 'LIVE' } })
    ])

    const online = streams.filter(s => s.status === 'ONLINE').length
    const offline = streams.filter(s => s.status === 'OFFLINE').length
    const total = streams.length
    
    // Calcul du score de santé (Health %)
    const health = total > 0 ? Math.round((online / total) * 100) : 100

    return NextResponse.json({
      online,
      offline,
      live: liveMatches,
      health,
      total
    })
  } catch (error) {
    console.error('[API Admin Stats] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
