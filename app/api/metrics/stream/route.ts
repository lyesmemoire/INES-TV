import { NextResponse } from "next/server"
import { getCurrentMetrics, getActiveSessions, getAllStreamHealth } from "@/lib/analytics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const [metrics, sessions, streamHealth] = await Promise.all([
            getCurrentMetrics(),
            getActiveSessions(),
            getAllStreamHealth(),
          ])

          const payload = {
            ...metrics,
            sessionCount: sessions.length,
            streamHealth: streamHealth.map((s: any) => ({
              channelId: s.channelId,
              status: s.status,
              viewers: s.viewers,
            })),
            timestamp: Date.now(),
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          )
        } catch (error) {
          console.error("SSE error:", error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: true })}\n\n`)
          )
        }
      }

      // Initial send
      await send()

      // Update every second
      const interval = setInterval(send, 1000)

      // Cleanup
      return () => {
        clearInterval(interval as any)
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
