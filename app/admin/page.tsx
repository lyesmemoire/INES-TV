"use client"

import { useEffect, useState } from "react"
import MetricsChart from "./components/MetricsChart"
import StreamHealthPanel from "./components/StreamHealthPanel"
import UserSessionsMap from "./components/UserSessionsMap"
import AlertsPanel from "./components/AlertsPanel"
import RealtimeGraph from "./components/RealtimeGraph"
import StatsCard from "./components/StatsCard"

type Metrics = {
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

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const eventSource = new EventSource("/api/metrics/stream")

    eventSource.onopen = () => {
      setConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.error) {
          setError("Failed to fetch metrics")
          return
        }

        setMetrics(data)
        
        // Keep last 60 data points (1 minute at 1Hz)
        setMetricsHistory(prev => {
          const updated = [...prev, data]
          return updated.slice(-60)
        })
      } catch (err) {
        console.error("Failed to parse metrics:", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error("SSE error:", err)
      setConnected(false)
      setError("Connection lost. Reconnecting...")
      eventSource.close()
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      
      {/* HEADER */}
      <header className="border-b border-gray-800 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                ⚡ SRE Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">Real-time system monitoring</p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                connected 
                  ? "bg-green-600/20 text-green-400 border border-green-600/30" 
                  : "bg-red-600/20 text-red-400 border border-red-600/30 animate-pulse"
              }`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                {connected ? "LIVE" : "DISCONNECTED"}
              </div>

              {metrics && (
                <div className="text-xs text-gray-500">
                  Updated {new Date(metrics.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-600/10 border-l-4 border-red-600 px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            label="Active Users"
            value={metrics?.activeUsers ?? 0}
            change={calculateChange(metricsHistory, "activeUsers")}
            icon="👥"
            color="blue"
          />

          <StatsCard
            label="Active Streams"
            value={metrics?.activeStreams ?? 0}
            change={calculateChange(metricsHistory, "activeStreams")}
            icon="📺"
            color="purple"
          />

          <StatsCard
            label="Cache Hit Rate"
            value={`${((metrics?.cacheHitRate ?? 0) * 100).toFixed(1)}%`}
            change={calculateChange(metricsHistory, "cacheHitRate")}
            icon="⚡"
            color="green"
          />

          <StatsCard
            label="Avg Latency"
            value={`${metrics?.avgLatency ?? 0} ms`}
            change={calculateChange(metricsHistory, "avgLatency", true)}
            icon="🚀"
            color="orange"
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - REALTIME GRAPH */}
          <div className="lg:col-span-2 space-y-6">
            <RealtimeGraph
              data={metricsHistory}
              metrics={["activeUsers", "activeStreams"]}
            />

            <MetricsChart data={metricsHistory} />
          </div>

          {/* RIGHT COLUMN - STREAM HEALTH + ALERTS */}
          <div className="space-y-6">
            <StreamHealthPanel streams={metrics?.streamHealth ?? []} />
            <AlertsPanel />
          </div>
        </div>

        {/* SESSIONS MAP */}
        <UserSessionsMap />
      </div>
    </main>
  )
}

// =====================
// HELPERS
// =====================

function calculateChange(
  history: Metrics[],
  key: keyof Metrics,
  inverse = false
): number {
  if (history.length < 2) return 0

  const current = history[history.length - 1]?.[key] as number
  const previous = history[history.length - 2]?.[key] as number

  if (!current || !previous) return 0

  const change = ((current - previous) / previous) * 100
  return inverse ? -change : change
}
