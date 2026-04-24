import { PrismaClient } from "@prisma/client"
import { sendSlackAlert } from "./slack.js"
import { sendWebhookAlert } from "./webhook.js"
import { sendEmailAlert } from "./email.js"

const prisma = new PrismaClient()

export async function triggerAlert(alert: any) {
  // 1. Persist alert
  const saved = await prisma.alert.create({
    data: alert,
  })

  // 2. Dispatch channels in parallel
  await Promise.allSettled([
    sendSlackAlert(saved),
    sendWebhookAlert(saved),
    sendEmailAlert(saved),
  ])

  return saved
}
