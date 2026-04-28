"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Activity, Cpu, Shield, Zap } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { subscribeRealtime } from "@/src/lib/realtime/engine";
import { formatTime } from "@/src/lib/utils/time";

type SystemState = "HEALTHY" | "DEGRADED" | "CRITICAL";

export default function BrainDashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [systemState, setSystemState] = useState<SystemState>("HEALTHY");
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);

  // 🧠 HYDRATION LOCK
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 REALTIME ENGINE — runs only when mounted=true (hook is always called, but logic gated)
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  const stats = useMemo(() => {
    return {
      total: anomalies.length,
      blocked: anomalies.filter((a) => a.actionTaken === "BLOCK").length,
      riskAvg: anomalies.length > 0
        ? anomalies.reduce((acc, a) => acc + (a.score || 0), 0) / anomalies.length
        : 0,
    };
  }, [anomalies]);

  // ❌ BLOCK SSR RENDER — placed AFTER all hooks
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm tracking-wider">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  const stateColor = systemState === "CRITICAL"
    ? "text-red-500"
    : systemState === "DEGRADED"
    ? "text-yellow-500"
    : "text-emerald-400";

  const stateDot = systemState === "CRITICAL"
    ? "bg-red-500"
    : systemState === "DEGRADED"
    ? "bg-yellow-500"
    : "bg-emerald-400";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">

      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-gray-800/50 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">INES TV Control Tower</h1>
            <p className="text-xs text-gray-500">Realtime Monitoring • SaaS Grade</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stateDot} animate-pulse`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${stateColor}`}>
            {systemState}
          </span>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPI
          label="TOTAL EVENTS"
          value={stats.total}
          icon={<Activity className="w-4 h-4 text-blue-400" />}
          accent="blue"
        />
        <KPI
          label="BLOCKED"
          value={stats.blocked}
          icon={<Shield className="w-4 h-4 text-red-400" />}
          accent="red"
        />
        <KPI
          label="AVG RISK SCORE"
          value={stats.riskAvg.toFixed(3)}
          icon={<Zap className="w-4 h-4 text-amber-400" />}
          accent="amber"
        />
      </div>

      {/* CHART */}
      <div className="bg-gray-900/20 p-5 rounded-2xl border border-gray-800/50 mb-8 backdrop-blur-sm">
        <h2 className="text-sm text-gray-400 flex items-center gap-2 mb-4 font-medium">
          <Activity size={14} className="text-cyan-400" /> System Health Stream
        </h2>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthData}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="avgLatencyMs"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#healthGradient)"
                dot={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ANOMALIES FEED */}
        <section className="lg:col-span-8 bg-gray-900/20 p-5 rounded-2xl border border-gray-800/50">
          <h2 className="text-sm text-gray-400 mb-4 font-medium">
            Realtime Events
          </h2>

          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {anomalies.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                En attente d&apos;événements...
              </div>
            ) : (
              anomalies.map((a, i) => (
                <div
                  key={a.id || i}
                  className="p-3 border border-gray-800/50 rounded-xl bg-black/40 hover:border-gray-700 transition-colors"
                >
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="font-mono">user: {a.userId?.slice(0, 8) || "Unknown"}</span>
                    <span>{formatTime(a.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-sm">
                      <span className={`font-bold ${(a.score || 0) > 0.7 ? "text-red-400" : (a.score || 0) > 0.4 ? "text-amber-400" : "text-emerald-400"}`}>
                        risk: {((a.score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    {a.actionTaken === "BLOCK" && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        BLOCKED
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* HEALTH SIDEBAR */}
        <aside className="lg:col-span-4 bg-gray-900/20 p-5 rounded-2xl border border-gray-800/50">
          <h2 className="text-sm text-gray-400 mb-4 font-medium">
            System Health
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full ${stateDot} animate-pulse`} />
            <div className={`text-2xl font-bold ${stateColor}`}>
              {systemState}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Snapshots</span>
              <span className="text-gray-300 font-mono">{healthData.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Anomalies</span>
              <span className="text-gray-300 font-mono">{anomalies.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Blocked</span>
              <span className="text-red-400 font-mono">{stats.blocked}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">
              Powered by Supabase Realtime
            </p>
          </div>
        </aside>

      </main>
    </div>
  );
}

function KPI({ label, value, icon, accent }: { label: string; value: any; icon: React.ReactNode; accent: string }) {
  const borderColor = accent === "red" ? "border-red-500/20" : accent === "amber" ? "border-amber-500/20" : "border-blue-500/20";
  const bgColor = accent === "red" ? "bg-red-500/5" : accent === "amber" ? "bg-amber-500/5" : "bg-blue-500/5";

  return (
    <div className={`${bgColor} p-5 rounded-2xl border ${borderColor} backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </div>
  );
}
