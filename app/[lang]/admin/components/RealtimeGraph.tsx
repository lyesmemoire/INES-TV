"use client"

import React, { memo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"

type RealtimeGraphProps = {
  data: any[]
  metrics: string[]
}

const metricColors: Record<string, string> = {
  activeUsers: "#f5a623", // Action Primary
  activeStreams: "#f5a623", 
  avgLatency: "#f5a623",
  errorRate: "#d63b2f", // Action Danger
  cacheHitRate: "#10b981",
}

function RealtimeGraphComponent({ data, metrics }: RealtimeGraphProps) {
  return (
    <div className="w-full">
      <h2 
        className="uppercase"
        style={{ 
          fontSize: 'var(--font-size-xs)', 
          fontWeight: 900, 
          letterSpacing: '0.1em', 
          color: 'var(--color-text-inverse)',
          marginBottom: 'var(--space-8)'
        }}
      >
        Activité en temps réel
      </h2>

      {data.length === 0 ? (
        <div 
          className="h-64 flex items-center justify-center"
          style={{ color: 'var(--color-text-inverse)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}
        >
          En attente de données...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => format(new Date(ts), "HH:mm:ss")}
              stroke="var(--color-text-inverse)"
              style={{ fontSize: "10px", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--color-text-inverse)" 
              style={{ fontSize: "10px", fontWeight: "bold" }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-strong)",
                border: "1px solid var(--color-surface-raised)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: "bold",
                color: "var(--color-text-primary)"
              }}
              labelFormatter={(ts) => format(new Date(ts), "HH:mm:ss")}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ 
                fontSize: '10px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                paddingBottom: '20px'
              }}
            />
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={metricColors[metric] || "var(--color-action-primary)"}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "var(--color-text-tertiary)", stroke: metricColors[metric], strokeWidth: 2 }}
                name={metric.replace(/([A-Z])/g, " $1").trim()}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const RealtimeGraph = memo(RealtimeGraphComponent)
export default RealtimeGraph
