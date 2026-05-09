export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 })
    }

    const grouped = await prisma.matchEngagementLog.groupBy({
      by: ['matchId', 'type'],
      _count: true,
    })

    // Execute in a transaction or sequentially to avoid concurrent update conflicts
    for (const row of grouped) {
      if (row.type === 'VIEW') {
        await prisma.match.update({
          where: { id: row.matchId },
          data: { viewCount: row._count }
        }).catch(err => console.error(`[CRON ERROR] Failed to update VIEW for match ${row.matchId}`, err))
      }

      if (row.type === 'CLICK') {
        await prisma.match.update({
          where: { id: row.matchId },
          data: { clickCount: row._count }
        }).catch(err => console.error(`[CRON ERROR] Failed to update CLICK for match ${row.matchId}`, err))
      }
    }

    return Response.json({ success: true, processed: grouped.length })
  } catch (error) {
    console.error("[CRON ERROR] Engagement Aggregation:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
