import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function trackUsage(
  tenantId: string,
  type: "api" | "sse" | "metrics" | "stream"
) {
  const today = new Date().toISOString().split("T")[0]

  await prisma.tenantUsage.upsert({
    where: {
      tenantId_date: {
        tenantId,
        date: new Date(today)
      }
    },
    update: {
      ...(type === "api" && { apiCalls: { increment: 1 } }),
      ...(type === "sse" && { sseConnections: { increment: 1 } }),
      ...(type === "metrics" && { metricsRequests: { increment: 1 } }),
      ...(type === "stream" && { streamEvents: { increment: 1 } })
    },
    create: {
      tenantId,
      date: new Date(today),
      apiCalls: type === "api" ? 1 : 0,
      sseConnections: type === "sse" ? 1 : 0,
      metricsRequests: type === "metrics" ? 1 : 0,
      streamEvents: type === "stream" ? 1 : 0
    }
  })
}
