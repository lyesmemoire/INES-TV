import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function sendWebhookAlert(alert: any) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: alert.tenantId },
  })

  if (!tenant?.webhookUrl) return

  await fetch(tenant.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-StreamPerf-Signature": "secure-v1",
    },
    body: JSON.stringify(alert),
  }).catch(e => console.error("Webhook alert failed:", e.message))
}
