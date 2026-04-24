"use client"

import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const interval = setInterval(fetchData, 2000)
    fetchData()
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/engine/live")
      const json = await res.json()
      setData(json.data)
    } catch {}
  }

  if (!data) {
    return <div className="p-10 text-white">Loading NOC...</div>
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-6">🛰️ STREAM NOC DASHBOARD</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card title="Active Sessions" value={data.activeSessions} />
        <Card title="Total Load" value={data.totalLoad} />
        <Card title="Sources" value={data.activeSources} />
      </div>

      {/* Loads */}
      <h2 className="text-xl mb-2">Source Load</h2>
      <div className="space-y-2">
        {Object.entries(data.loads).map(([id, load]: any) => (
          <div key={id} className="flex justify-between bg-gray-800 p-2 rounded">
            <span>{id}</span>
            <span>{load}</span>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <h2 className="text-xl mt-6 mb-2">Sessions Sample</h2>
      <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(data.sampleSessions, null, 2)}
      </pre>
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-gray-800 p-4 rounded">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
