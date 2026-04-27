"use client"

import { useEffect, useState } from "react"

type Alert = {
  id: string
  type: "error" | "warning" | "info"
  message: string
  timestamp: number
  resolved: boolean
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    fetch("/api/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error)

    const interval = setInterval(() => {
      fetch("/api/alerts")
        .then(res => res.json())
        .then(data => setAlerts(data))
        .catch(console.error)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      case "warning":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "info":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  const unresolvedAlerts = alerts.filter(a => !a.resolved)

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Alerts</h2>
        {unresolvedAlerts.length > 0 && (
          <div className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
            {unresolvedAlerts.length} active
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No alerts
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 ${
                alert.resolved ? "opacity-50" : ""
              } ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium mb-1">{alert.message}</div>
                  <div className="text-xs opacity-60">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>

                {alert.resolved ? (
                  <div className="text-xs text-green-400">✓ Resolved</div>
                ) : (
                  <button
                    onClick={() => {
                      fetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" })
                        .then(() => {
                          setAlerts(prev =>
                            prev.map(a =>
                              a.id === alert.id ? { ...a, resolved: true } : a
                            )
                          )
                        })
                    }}
                    className="text-xs hover:underline"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
