"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

type RealtimeGraphProps = {
  data: any[]
  metrics: string[]
}

const metricColors: Record<string, string> = {
  activeUsers: "#3b82f6",
  activeStreams: "#8b5cf6",
  avgLatency: "#f59e0b",
  errorRate: "#ef4444",
  cacheHitRate: "#10b981",
}

export default function RealtimeGraph({ data, metrics }: RealtimeGraphProps) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Real-time Activity</h2>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Waiting for data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => format(new Date(ts), "HH:mm:ss")}
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelFormatter={(ts) => format(new Date(ts), "HH:mm:ss")}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={metricColors[metric]}
                strokeWidth={2}
                dot={false}
                name={metric.replace(/([A-Z])/g, " $1").trim()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
