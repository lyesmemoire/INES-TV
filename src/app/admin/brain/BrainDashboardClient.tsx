"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Activity, Cpu } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { subscribeRealtime } from "@/src/lib/realtime/engine";
import { formatTime } from "@/src/lib/utils/time";

type SystemState = "HEALTHY" | "DEGRADED" | "CRITICAL";

export default function BrainDashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [systemState, setSystemState] = useState<SystemState>("HEALTHY");
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);

  // 🧠 HYDRATION LOCK (CRITICAL)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ❌ BLOCK SSR RENDER COMPLETELY
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-500 font-bold animate-pulse">Loading system...</p>
      </div>
    );
  }

  // 🔥 REALTIME ENGINE (SAFE — RUNS ONLY AFTER MOUNT)
  useEffect(() => {
    const unsubA = subscribeRealtime({
      table: "AIAnomalyScore",
      event: "INSERT",
      channel: "anomalies",
      onData: (payload) => {
        setAnomalies((prev) => [payload.new, ...prev].slice(0, 50));
      },
    });

    const unsubH = subscribeRealtime({
      table: "SystemHealthSnapshot",
      event: "INSERT",
      channel: "health",
      onData: (payload) => {
        setHealthData((prev) => [...prev, payload.new].slice(-30));
        setSystemState(payload.new.status);
      },
    });

    return () => {
      unsubA();
      unsubH();
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: anomalies.length,
      blocked: anomalies.filter((a) => a.actionTaken === "BLOCK").length,
      riskAvg: anomalies.length > 0
        ? anomalies.reduce((acc, a) => acc + (a.score || 0), 0) / anomalies.length
        : 0,
    };
  }, [anomalies]);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER (STATIC SAFE AFTER MOUNT) */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Cpu className="text-cyan-400" />
          SaaS Control Tower
        </h1>

        <span className={`text-xs font-bold ${
          systemState === "CRITICAL"
            ? "text-red-500"
            : systemState === "DEGRADED"
            ? "text-yellow-500"
            : "text-green-400"
        }`}>
          {systemState}
        </span>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPI label="EVENTS" value={stats.total} />
        <KPI label="BLOCKED" value={stats.blocked} />
        <KPI label="RISK AVG" value={stats.riskAvg.toFixed(3)} />
      </div>

      {/* CHART */}
      <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800 mb-6">
        <h2 className="text-sm text-gray-400 flex items-center gap-2 mb-4">
          <Activity size={14} /> System Health Stream
        </h2>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData}>
              <Line
                type="monotone"
                dataKey="avgLatencyMs"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
              />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <main className="grid grid-cols-12 gap-6">

        {/* ANOMALIES */}
        <section className="col-span-8 bg-gray-900/30 p-4 rounded-lg">
          <h2 className="text-sm text-gray-400 mb-3">
            Realtime Events
          </h2>

          <div className="space-y-2">
            {anomalies.map((a, i) => (
              <div
                key={a.id || i}
                className="p-3 border border-gray-800 rounded bg-black"
              >
                <div className="flex justify-between text-xs text-gray-500">
                  <span>user: {a.userId?.slice(0, 8) || "Unknown"}</span>
                  <span>{formatTime(a.createdAt)}</span>
                </div>

                <div className="text-red-400 text-sm mt-1">
                  risk: {((a.score || 0) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HEALTH */}
        <aside className="col-span-4 bg-gray-900/30 p-4 rounded-lg">
          <h2 className="text-sm text-gray-400 mb-3">
            System Health
          </h2>

          <div className="text-2xl font-bold">
            {systemState}
          </div>

          <div className="text-xs text-gray-500 mt-4">
            snapshots: {healthData.length}
          </div>
        </aside>

      </main>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-800">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
