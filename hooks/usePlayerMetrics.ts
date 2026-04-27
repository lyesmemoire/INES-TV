import { useEffect, useRef } from "react"

type MetricsData = {
  currentTime: number
  quality: number
  buffered: number
  isPlaying: boolean
  error: string | null
}

export function usePlayerMetrics(
  channelId: string,
  data: MetricsData,
  enabled = true
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      const now = Date.now()
      
      // Throttle: minimum 5s between sends
      if (now - lastSentRef.current < 5000) return

      try {
        await fetch("/api/metrics/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId,
            timestamp: now,
            currentTime: Math.floor(data.currentTime),
            quality: data.quality,
            bufferedSeconds: Math.floor(data.buffered - data.currentTime),
            isPlaying: data.isPlaying,
            hasError: !!data.error,
          }),
        })

        lastSentRef.current = now
      } catch (err) {
        console.error("Metrics failed:", err)
        // Don't spam logs, fail silently
      }
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [channelId, enabled]) // ⚠️ NE PAS INCLURE data

  // Send on unmount
  useEffect(() => {
    return () => {
      if (data.isPlaying) {
        // Send final metric
        navigator.sendBeacon(
          "/api/metrics/player",
          JSON.stringify({ channelId, event: "stop" })
        )
      }
    }
  }, [])
}
