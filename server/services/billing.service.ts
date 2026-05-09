import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getTenantPlan(tenantId: string) {
  return prisma.tenantPlan.findUnique({ where: { tenantId } })
}

export async function getTenantQuota(tenantId: string) {
  return prisma.tenantQuota.findUnique({ where: { tenantId } })
}

export const billingService = {
  async createSubscription(userId: string, plan: string) {
    return { success: true, plan }
  },
  async cancelSubscription(userId: string) {
    return { success: true }
  },
  async getSubscription(userId: string) {
    return null
  },
  async checkAccess(userId: string, plan: string) {
    return true
  },
  async createCheckoutSession(userId: string, plan: string) {
    return { url: "https://billing.INES TV.com/session_placeholder" }
  },
  async handleWebhook(rawBody: string, sig: string) {
    return { success: true }
  }
}

