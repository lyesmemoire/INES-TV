"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

export default function MetricsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Historical Latency Trends</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Waiting for historical data...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Historical Latency Trends (ms)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(ts) => format(new Date(ts), "HH:mm")}
            stroke="#9ca3af"
          />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
            labelFormatter={(ts) => format(new Date(ts), "HH:mm:ss")}
          />
          <Area type="monotone" dataKey="avgLatency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLatency)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
