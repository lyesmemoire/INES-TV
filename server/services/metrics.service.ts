import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getMetrics(tenantId?: string) {
  const now = new Date()
  const last5min = new Date(now.getTime() - 5 * 60 * 1000)

  const whereTenant = tenantId ? { tenantId } : {}

  const activeStreams = await prisma.streamSessionLive.count({
    where: {
      ended_at: null,
      ...whereTenant
    }
  })

  const latencyAgg = await prisma.streamEvent.aggregate({
    _avg: { latency: true },
    where: {
      createdAt: { gte: last5min },
      ...whereTenant
    }
  })

  const totalEvents = await prisma.streamEvent.count({
    where: {
      createdAt: { gte: last5min },
      ...whereTenant
    }
  })

  const errors = await prisma.streamEvent.count({
    where: {
      status: "ERROR",
      createdAt: { gte: last5min },
      ...whereTenant
    }
  })

  const avgLatency = latencyAgg._avg.latency || 0
  const errorRate = totalEvents > 0 ? errors / totalEvents : 0

  const topChannels = await prisma.streamSessionLive.groupBy({
    by: ["channelId"],
    _count: { channelId: true },
    orderBy: { _count: { channelId: "desc" } },
    take: 5
  })

  return {
    activeStreams,
    avgLatency,
    errors,
    errorRate,
    topChannels
  }
}

export async function computeMetrics() {
  // Placeholder for unified business metrics
  return {
    mrr: 0,
    arpu: 0,
    ltv: 0,
    churn: 0,
    adsRevenue: 0,
    createdAt: new Date()
  }
}

