export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'

/**
 * 📊 CRON: Match Engagement Snapshotting
 * Captures engagement state every 10 minutes for trending calculations.
 * Also performs periodic cleanup of old snapshots.
 */
export async function GET(req: Request) {
  // 1. Cron Secret Protection
  const authHeader = req.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== cronSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 2. Capture Snapshots for Active Matches
    const matches = await prisma.match.findMany({
      where: {
        status: { in: ['LIVE', 'UPCOMING'] }
      }
    })

    if (matches.length > 0) {
      const snapshots = matches.map(match => ({
        matchId: match.id,
        views: match.viewCount,
        clicks: match.clickCount
      }))

      await prisma.matchEngagementSnapshot.createMany({
        data: snapshots
      })
      
      console.log(`[CRON] Created ${snapshots.length} engagement snapshots.`)
    }

    // 3. Data Retention Cleanup (Step 7)
    // Delete snapshots older than 7 days to keep the database lean.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const deleted = await prisma.matchEngagementSnapshot.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    })

    if (deleted.count > 0) {
      console.log(`[CRON] Cleaned up ${deleted.count} stale snapshots.`)
    }

    return Response.json({ 
      success: true, 
      snapshotsCreated: matches.length,
      snapshotsDeleted: deleted.count,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("[CRON SNAPSHOT ERROR]", err)
    return Response.json({ 
      success: false, 
      error: "Snapshot process failed",
      message: err.message 
    }, { status: 500 })
  }
}
