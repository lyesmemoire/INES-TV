import { prisma } from '@/lib/prisma'
import pLimit from 'p-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const limit = pLimit(5) // max 5 checks simultanés

async function checkStream(stream: any) {
  if (!stream?.sourceUrl || !stream.sourceUrl.startsWith('http') || stream.sourceUrl.length > 500) return;

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(stream.sourceUrl, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)

    await prisma.stream.update({
      where: { id: stream.id },
      data: {
        status: response.ok ? 'ONLINE' : 'OFFLINE',
        lastCheckedAt: new Date(),
      },
    })
  } catch {
    await prisma.stream.update({
      where: { id: stream.id },
      data: {
        status: 'OFFLINE',
        lastCheckedAt: new Date(),
      },
    })
  }
}

export async function GET() {
  const streams = await prisma.stream.findMany({
    where: { isActive: true },
  })

  await Promise.all(
    streams.map(stream =>
      limit(() => checkStream(stream))
    )
  )

  return new Response('Health check completed')
}
