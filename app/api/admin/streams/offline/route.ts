export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 📡 API: /api/admin/streams/offline
 * Récupère tous les flux actuellement marqués comme OFFLINE.
 */
export async function GET() {
  try {
    const streams = await prisma.stream.findMany({
      where: { 
        status: 'OFFLINE',
        isActive: true
      },
      include: {
        channel: true
      },
      orderBy: { lastCheckedAt: 'desc' }
    })

    return NextResponse.json({ streams })
  } catch (error) {
    console.error('[API Admin Streams Offline] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
