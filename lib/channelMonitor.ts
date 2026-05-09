import { prisma } from "@/lib/prisma"

const MAX_FAILS = 3
const TIMEOUT = 5000

const blockedDomains = [
  "malicious-domain.com",
  "blacklisted-stream.com"
]

function isBlockedDomain(url: string) {
  return blockedDomains.some(domain => url.includes(domain))
}

async function checkStream(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT)

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeout)

    return res.ok
  } catch {
    return false
  }
}

export async function monitorChannels(batchSize = 50) {
  // ⚡ Scalable Batching: Check channels that haven't been checked recently
  const channels = await prisma.channel.findMany({
    where: {
      healthStatus: { in: ["ACTIVE", "DISABLED"] }
    },
    orderBy: {
      lastChecked: 'asc' // Prioritize old checks
    },
    take: batchSize
  })

  console.log(`[MONITOR] Starting check for ${channels.length} channels...`)

  for (const channel of channels) {
    if (!channel.streamUrl) continue

    if (isBlockedDomain(channel.streamUrl)) {
      await prisma.channel.update({
        where: { id: channel.id },
        data: { healthStatus: "BLOCKED" }
      })
      continue
    }

    const isAlive = await checkStream(channel.streamUrl)

    if (isAlive) {
      await prisma.channel.update({
        where: { id: channel.id },
        data: {
          healthStatus: "ACTIVE",
          failCount: 0,
          lastChecked: new Date(),
          lastSuccess: new Date()
        }
      })
    } else {
      const newFailCount = (channel.failCount || 0) + 1

      await prisma.channel.update({
        where: { id: channel.id },
        data: {
          failCount: newFailCount,
          lastChecked: new Date(),
          lastFailure: new Date(),
          healthStatus: newFailCount >= MAX_FAILS ? "DISABLED" : (channel.healthStatus as any)
        }
      })
    }
  }
}
