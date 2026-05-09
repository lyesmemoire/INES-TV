"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type Metrics = {
  timestamp: number
  activeUsers: number
  activeStreams: number
  cacheHitRate: number
  avgLatency: number
  errorRate: number
  bandwidthUsage: number
  sessionCount: number
  streamHealth: Array<{
    channelId: string
    status: string
    viewers: number
  }>
}

/**
 * ⚡ useMetrics Hook (Enterprise Scale)
 * Basculé de SSE vers Supabase Realtime Broadcast pour un scale illimité.
 */
export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [history, setHistory] = useState<Metrics[]>([])
  const [connected, setConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    // 🔗 Souscription au canal de broadcast 'sre-metrics'
    const channel = supabase.channel("sre-metrics", {
      config: {
        broadcast: { self: false },
      },
    })

    channel
      .on("broadcast", { event: "metrics-update" }, (payload) => {
        const data = payload.payload as Metrics
        if (!data) return

        setMetrics(data)
        setLastUpdated(new Date(data.timestamp).toLocaleTimeString())

        // 🔥 Alerting critique
        if (data.errorRate > 5) {
          console.error("🚨 CRITICAL: High Error Rate detected!")
        }

        setHistory(prev => {
          if (prev.length >= 60) {
            return [...prev.slice(1), data]
          }
          return [...prev, data]
        })
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED")
        if (status === "SUBSCRIBED") {
          console.log("🟢 Realtime metrics channel active")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { metrics, history, connected, lastUpdated }
}
