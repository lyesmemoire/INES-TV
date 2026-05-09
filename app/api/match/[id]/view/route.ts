export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(',')[0] ||
      "unknown"

    const matchId = params.id

    const recent = await prisma.matchEngagementLog.findFirst({
      where: {
        matchId,
        ip,
        type: 'VIEW',
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes throttle
        }
      }
    })

    if (!recent) {
      await prisma.matchEngagementLog.create({
        data: {
          matchId,
          ip,
          type: 'VIEW'
        }
      })
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error("[TRACKING ERROR] VIEW:", error)
    return Response.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
  }
}
