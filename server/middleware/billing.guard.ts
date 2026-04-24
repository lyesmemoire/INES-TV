import { getTenantQuota } from "../services/billing.service.js"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function enforceQuota(tenantId: string) {
  const quota = await getTenantQuota(tenantId)
  if (!quota) return true // no explicit restrictor block => bypass

  const today = new Date().toISOString().split("T")[0]

  const usage = await prisma.tenantUsage.findUnique({
    where: {
      tenantId_date: {
        tenantId,
        date: new Date(today)
      }
    }
  })

  // Silent pass-through if no usage tracked yet
  if (!usage) return true

  if (usage.apiCalls > quota.maxApiCallsPerDay) {
    throw new Error("DAILY_API_QUOTA_EXCEEDED")
  }

  if (usage.sseConnections > quota.maxSseConnections) {
    throw new Error("SSE_QUOTA_EXCEEDED")
  }

  return true
}
