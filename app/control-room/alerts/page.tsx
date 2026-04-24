"use client"

import { useEffect, useState } from "react"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts")
        if (res.ok) {
          setAlerts(await res.json())
        }
      } catch (err) {
        console.error("Failed to fetch alerts", err)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-500 border-red-500 bg-red-500/10"
      case "WARNING": return "text-yellow-500 border-yellow-500 bg-yellow-500/10"
      default: return "text-blue-500 border-blue-500 bg-blue-500/10"
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white font-mono space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <span className="text-3xl">🚨</span>
          <h1 className="text-2xl font-bold">Live Alerts Dashboard</h1>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-500 italic">No alerts triggered for this tenant. Systems nominal.</p>
      ) : (
        <div className="space-y-4">
            {alerts.map((a: any) => (
            <div key={a.id} className={`border p-4 rounded-lg flex flex-col gap-2 ${getSeverityStyle(a.severity)}`}>
                <div className="flex justify-between items-center">
                    <b className="uppercase tracking-wider font-bold">{a.severity} — {a.title}</b>
                    <span className="text-xs opacity-70">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="opacity-90">{a.message}</p>
                {a.value && (
                    <div className="text-sm border-t border-current/20 pt-2 mt-2 flex justify-between">
                        <span>Metric: {a.metric}</span>
                        <span>Value: <b>{a.value}</b> (Threshold: {a.threshold})</span>
                    </div>
                )}
            </div>
            ))}
        </div>
      )}
    </div>
  )
}
