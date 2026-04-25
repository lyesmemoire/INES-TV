"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Tv2,
  Facebook,
  Trash2,
  Plus,
  LayoutGrid,
  ShieldAlert,
  Activity,
  ToggleLeft,
  ToggleRight,
  Database,
  History,
  RotateCw,
  Eye,
  TrendingUp,
  TrendingDown,
  Flame,
  Radio,
  AlertTriangle,
  Minus,
} from "lucide-react";

/**
 * 📁 /app/admin/editorial/page.tsx
 * 🏟️ v1.5 TACTICAL FORESIGHT — Anticipatory NOC Control Room
 *
 * Upgrade over v1.4:
 *   - MomentumStrip: top-5 channels with live slope arrows
 *   - ForecastAlert: sticky warning when HOT transition predicted
 *   - HeatmapNode: momentum badge + prewarm tier in tooltip
 *   - 2 new KPI boxes: Momentum Accelerating + Pre-Warm Active
 *   - Socket subscription to ops:forecast (5s broadcast)
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface MomentumData {
  slope_30s: number;
  slope_60s: number;
  heatAcceleration: number;
  predictedTransition: "HOT" | "WARM" | "DEAD" | null;
  prewarmRecommended: boolean;
  degradationWarning: boolean;
}

interface HeatmapNodeData {
  id: string;
  liveness: "HOT" | "WARM" | "DEAD" | "FAILOVER";
  pressure: number;
  status: string;
  failoverCount: number;
  activeSource: string;
  viewerCount?: number;
  lastSeenAt: number;
  momentum: MomentumData | null;
  prewarmTier: "FULL" | "DUAL" | "HEARTBEAT_ONLY";
  degradationWarning: boolean;
}

interface ForecastChannel {
  channelId: string;
  heatAcceleration: number;
  slope_30s: number;
  predictedTransition: "HOT" | "WARM" | "DEAD" | null;
  prewarmRecommended: boolean;
  degradationWarning: boolean;
  predictedPressure: number;
}

interface PrewarmStats {
  full: number;
  dual: number;
  heartbeatOnly: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function EditorialControlRoom() {
  const [nodes, setNodes] = useState<HeatmapNodeData[]>(
    Array(100).fill(null)
  );
  const [metrics, setMetrics] = useState<any>({});
  const [flags, setFlags] = useState<any>({});
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastChannel[]>([]);
  const [prewarmStats, setPrewarmStats] = useState<PrewarmStats>({
    full: 0, dual: 0, heartbeatOnly: 0, total: 0,
  });

  useEffect(() => {
    // ── 1. INITIAL SNAPSHOT ──────────────────────────────────────────────────
    async function fetchInitialData() {
      try {
        const [mRes, fRes, sRes, flRes] = await Promise.all([
          fetch("/api/admin/saas/streams", {
            headers: { "x-admin-secret": "staff_emerge_key" },
          }),
          fetch("/api/admin/saas/editorial/featured", {
            headers: { "x-admin-secret": "staff_emerge_key" },
          }),
          fetch("/api/admin/ops/snapshot", {
            headers: { "x-admin-secret": "staff_emerge_key" },
          }),
          fetch("/api/admin/ops/flags", {
            headers: { "x-admin-secret": "staff_emerge_key" },
          }),
        ]);

        const f = await fRes.json();
        const s = await sRes.json();
        const fl = await flRes.json();

        setFeatured(f);
        setFlags(fl);

        const matrix: any[] = Array(100).fill(null);
        s.forEach((node: any, i: number) => {
          if (i < 100) matrix[i] = node;
        });
        setNodes(matrix);
      } catch (e) {
        console.error("NOC Hydration Failed");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();

    // ── 2. REAL-TIME TELEMETRY ───────────────────────────────────────────────
    const socket: Socket = io("/ops", { transports: ["websocket"] });

    socket.emit("ops:join", "ops:heatmap");
    socket.emit("ops:join", "ops:status");
    socket.emit("ops:join", "ops:forecast");

    socket.on("heatmap:snapshot", (updatedNodes: HeatmapNodeData[]) => {
      setNodes((prev) => {
        const next = [...prev];
        updatedNodes.forEach((node, i) => {
          if (i < 100) next[i] = node;
        });
        return next;
      });
    });

    socket.on("metrics:snapshot", (m: any) => {
      setMetrics(m);
      if (m.prewarm) setPrewarmStats(m.prewarm);
    });

    // v1.5 — Forecast (5s cadence)
    socket.on("forecast:snapshot", (data: { channels: ForecastChannel[]; ts: number }) => {
      setForecast(data.channels);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleFlag = async (flag: string, current: boolean) => {
    await fetch("/api/admin/ops/flags/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": "staff_emerge_key",
      },
      body: JSON.stringify({ flag, enabled: !current, actor: "admin_noc" }),
    });
    setFlags((prev: any) => ({ ...prev, [flag]: !current }));
  };

  const featureAction = async (matchId: string, isFeatured: boolean) => {
    const endpoint = isFeatured
      ? "/api/admin/saas/editorial/unfeature"
      : "/api/admin/saas/editorial/feature";
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": "staff_emerge_key",
      },
      body: JSON.stringify({ channelId: matchId, position: 0 }),
    });
    window.location.reload();
  };

  // Derived KPIs
  const hotNodes = nodes.filter((n) => n?.liveness === "HOT").length;
  const momentumAccel = nodes.filter(
    (n) => n?.momentum && n.momentum.heatAcceleration > 0.2
  ).length;
  const prewarmActive = prewarmStats.full + prewarmStats.dual;

  // Top forecast alerts (predicted HOT transitions)
  const hotAlerts = forecast.filter((f) => f.predictedTransition === "HOT");
  const degradAlerts = forecast.filter((f) => f.degradationWarning);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 space-y-8 selection:bg-indigo-500/30 font-mono">

      {/* ── FORECAST ALERT BANNER ──────────────────────────────────────────── */}
      <AnimatePresence>
        {hotAlerts.length > 0 && (
          <motion.div
            key="forecast-alert"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                Predictive Foresight
              </span>
            </div>
            <div className="flex-1 flex flex-wrap gap-3">
              {hotAlerts.slice(0, 5).map((a) => (
                <span
                  key={a.channelId}
                  className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg"
                >
                  ⚡ {a.channelId.slice(0, 8)}… → HOT in ~3min
                  {a.prewarmRecommended && (
                    <span className="ml-1.5 text-emerald-500">| Pre-warm ON</span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-[8px] text-zinc-600 shrink-0">3–5 min horizon</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEGRADATION ALERT BANNER ────────────────────────────────────────── */}
      <AnimatePresence>
        {degradAlerts.length > 0 && (
          <motion.div
            key="degrad-alert"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex items-center gap-4 px-6 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5"
          >
            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
              Degradation Warning
            </span>
            <div className="flex-1 flex flex-wrap gap-2">
              {degradAlerts.slice(0, 4).map((a) => (
                <span key={a.channelId} className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  ↓ {a.channelId.slice(0, 8)}… (slope {(a.slope_30s * 100).toFixed(1)}%/s)
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP KPI STRIP ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricBox
          label="Failover Rate"
          value={metrics.failover || "0"}
          unit="events/min"
          icon={<ShieldAlert className="text-red-500" size={14} />}
          isAlert={parseInt(metrics.failover || "0") > 0}
        />
        <MetricBox
          label="HOT Nodes"
          value={hotNodes}
          unit="channels"
          icon={<Zap className="text-emerald-400" size={14} />}
        />
        <MetricBox
          label="Circuit Breakers"
          value={metrics.circuit_breaker_triggered || "0"}
          unit="active"
          icon={<Activity className="text-amber-500" size={14} />}
          isAlert={parseInt(metrics.circuit_breaker_triggered || "0") > 0}
        />
        <MetricBox
          label="Momentum ↑"
          value={momentumAccel}
          unit="accel."
          icon={<TrendingUp className="text-sky-400" size={14} />}
          isHighlight
        />
        <MetricBox
          label="Pre-Warm Active"
          value={prewarmActive}
          unit={`${prewarmStats.dual} dual`}
          icon={<Flame className="text-orange-400" size={14} />}
          isHighlight
        />
        <MetricBox
          label="Forecast Alerts"
          value={hotAlerts.length}
          unit="→ HOT"
          icon={<Radio className="text-indigo-400" size={14} />}
          isAlert={hotAlerts.length > 0}
          isHighlight={hotAlerts.length > 0}
        />
      </div>

      {/* ── MOMENTUM STRIP ──────────────────────────────────────────────────── */}
      {forecast.length > 0 && (
        <MomentumStrip channels={forecast} />
      )}

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* 🧱 MATRIX HEATMAP */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid size={18} className="text-zinc-600" />
              <h3 className="text-lg font-black uppercase tracking-tighter">
                Matrix Heatmap{" "}
                <span className="text-zinc-700 text-xs ml-2">10×10 NOC Grid</span>
              </h3>
            </div>
            <div className="flex items-center gap-5 text-[8px] font-black uppercase tracking-widest text-zinc-600">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Hot
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> Warm
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Failover
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={8} className="text-sky-400" /> Momentum
              </div>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2.5 aspect-square max-w-[680px]">
            {nodes.map((node, i) => (
              <HeatmapNode key={i} index={i} node={node} />
            ))}
          </div>
        </div>

        {/* 🎛️ OPS COMMAND */}
        <div className="lg:col-span-4 space-y-8">

          {/* Feature Flags */}
          <section className="bg-zinc-900/30 border border-white/5 rounded-[32px] p-7 space-y-6">
            <div className="flex items-center gap-3">
              <ToggleRight size={18} className="text-indigo-400" />
              <h3 className="text-base font-black uppercase tracking-tight">
                Feature Flags{" "}
                <span className="text-zinc-700 text-[10px] ml-1">Real-time Pilotage</span>
              </h3>
            </div>

            <div className="space-y-3">
              <FlagToggle
                label="Global Monetization"
                id="ads_active"
                enabled={flags.ads_active}
                onToggle={() => toggleFlag("ads_active", flags.ads_active)}
              />
              <FlagToggle
                label="Auto-Failover Engine"
                id="failover_active"
                enabled={flags.failover_active}
                onToggle={() => toggleFlag("failover_active", flags.failover_active)}
              />
              <FlagToggle
                label="Watchdog Sentinel"
                id="watchdog_enabled"
                enabled={flags.watchdog_enabled}
                onToggle={() => toggleFlag("watchdog_enabled", flags.watchdog_enabled)}
              />
              <FlagToggle
                label="Panic Mode (Global)"
                id="panic_mode"
                enabled={flags.panic_mode}
                onToggle={() => toggleFlag("panic_mode", flags.panic_mode)}
                isCritical
              />
            </div>
          </section>

          {/* Pre-Warm Stats */}
          <section className="bg-zinc-900/20 border border-white/5 rounded-[28px] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Flame size={16} className="text-orange-400" />
              <h3 className="text-sm font-black uppercase tracking-tight">
                Pre-Warm Engine{" "}
                <span className="text-zinc-700 text-[9px] ml-1">v1.5</span>
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <PreWarmStat label="FULL" value={prewarmStats.full} color="orange" />
              <PreWarmStat label="DUAL" value={prewarmStats.dual} color="indigo" />
              <PreWarmStat label="IDLE" value={prewarmStats.heartbeatOnly} color="zinc" />
            </div>
          </section>

          {/* Hero Curation */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <History size={16} className="text-zinc-600" />
              <h3 className="text-base font-black uppercase tracking-tight">Hero Curation</h3>
            </div>
            <div className="space-y-2">
              {featured.map((f, i) => (
                <div
                  key={f.id}
                  className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between"
                >
                  <div className="text-[9px] font-black uppercase">
                    <span className="text-indigo-500 mr-2">0{i + 1}</span>
                    {f.channel?.name ?? f.channelId}
                  </div>
                  <button
                    onClick={() => featureAction(f.channelId, true)}
                    className="text-red-500 hover:text-white transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOMENTUM STRIP — Top-N channels with live slope arrows
// ─────────────────────────────────────────────────────────────────────────────

function MomentumStrip({ channels }: { channels: ForecastChannel[] }) {
  const top = channels.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/20 border border-white/5 rounded-[28px] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp size={14} className="text-sky-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
          Momentum Engine — 3-5 min forecast
        </span>
        <span className="ml-auto text-[8px] text-zinc-700 font-bold">Recal. 1s</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {top.map((ch) => (
          <MomentumCard key={ch.channelId} channel={ch} />
        ))}
      </div>
    </motion.div>
  );
}

function MomentumCard({ channel: ch }: { channel: ForecastChannel }) {
  const accel = ch.heatAcceleration;
  const isRising = accel > 0.1;
  const isFalling = accel < -0.1;
  const isNeutral = !isRising && !isFalling;

  const Icon = isRising ? TrendingUp : isFalling ? TrendingDown : Minus;
  const colorClass = isRising
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : isFalling
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : "text-zinc-500 bg-white/5 border-white/5";

  return (
    <motion.div
      layout
      className={`p-3 rounded-2xl border ${colorClass} space-y-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase text-zinc-500 truncate max-w-[80px]">
          {ch.channelId.slice(0, 8)}…
        </span>
        <Icon size={11} />
      </div>
      <div className="text-[18px] font-black tracking-tighter leading-none">
        {accel >= 0 ? "+" : ""}
        {(accel * 100).toFixed(1)}
        <span className="text-[8px] font-bold text-zinc-600 ml-0.5">%</span>
      </div>
      {ch.predictedTransition && (
        <div className="text-[7px] font-black uppercase">
          → {ch.predictedTransition}{" "}
          <span className="text-zinc-600 font-bold">predicted</span>
        </div>
      )}
      {ch.degradationWarning && (
        <div className="text-[7px] text-amber-400 font-bold flex items-center gap-1">
          <AlertTriangle size={7} /> Degrad.
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEATMAP NODE — v1.5: momentum badge + prewarm tier in tooltip
// ─────────────────────────────────────────────────────────────────────────────

function HeatmapNode({ index, node }: { index: number; node: HeatmapNodeData | null }) {
  const isIdle = !node;
  const isHot = node?.liveness === "HOT";
  const isWarm = node?.liveness === "WARM";
  const isFailover = node?.liveness === "FAILOVER";
  const hasMomentum = node?.momentum && Math.abs(node.momentum.heatAcceleration) > 0.1;
  const isDegrading = node?.degradationWarning;
  const isAccelerating = node?.momentum && node.momentum.heatAcceleration > 0.15;

  const colorClass = isIdle
    ? "bg-zinc-900/40"
    : isFailover
    ? "bg-red-600 shadow-[0_0_14px_rgba(220,38,38,0.45)] animate-pulse"
    : isHot && isDegrading
    ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
    : isHot
    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
    : isWarm
    ? "bg-amber-500/50"
    : "bg-zinc-800/60";

  return (
    <div className="relative group flex-1 aspect-square">
      <motion.div
        layout
        className={`w-full h-full rounded-lg transition-colors duration-500 flex items-center justify-center text-[7px] font-black text-black/30 ${colorClass}`}
      >
        {String(index).padStart(2, "0")}

        {/* Viewer count badge */}
        {(isHot || isFailover) && node!.viewerCount && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[5px] px-1 rounded-sm border border-white/10 flex items-center gap-0.5 z-10 whitespace-nowrap">
            <Eye size={5} /> {(node!.viewerCount / 1000).toFixed(1)}K
          </div>
        )}

        {/* Momentum arrow badge (v1.5) */}
        {(isHot || isFailover) && hasMomentum && (
          <div className="absolute -top-1 -right-1 z-10">
            {isAccelerating ? (
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="bg-sky-500 rounded-full w-3 h-3 flex items-center justify-center shadow-[0_0_6px_rgba(14,165,233,0.6)]"
              >
                <TrendingUp size={6} className="text-white" />
              </motion.div>
            ) : isDegrading ? (
              <div className="bg-amber-500 rounded-full w-3 h-3 flex items-center justify-center animate-pulse">
                <TrendingDown size={6} className="text-black" />
              </div>
            ) : null}
          </div>
        )}

        {/* Pre-warm tier dot (DUAL only — premium) */}
        {node?.prewarmTier === "DUAL" && (
          <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-400 rounded-full m-0.5 shadow-[0_0_6px_rgba(99,102,241,0.7)]" />
        )}
      </motion.div>

      {/* ── TOOLTIP ──────────────────────────────────────────────────────── */}
      {!isIdle && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3.5 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 min-w-[160px] backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase text-white truncate mb-2">
            {node!.id}
          </p>
          <div className="space-y-1.5">
            <TooltipRow
              label="Liveness"
              value={node!.liveness}
              valueClass={
                isHot
                  ? "text-emerald-400"
                  : isFailover
                  ? "text-red-400"
                  : "text-amber-400"
              }
            />
            <TooltipRow
              label="Pressure"
              value={`${(node!.pressure * 100).toFixed(0)}%`}
            />
            <TooltipRow
              label="Failovers"
              value={String(node!.failoverCount || 0)}
              valueClass={node!.failoverCount > 0 ? "text-red-500" : ""}
            />
            {node!.momentum && (
              <>
                <div className="border-t border-white/5 my-1.5" />
                <TooltipRow
                  label="Accel."
                  value={`${(node!.momentum.heatAcceleration >= 0 ? "+" : "")}${(node!.momentum.heatAcceleration * 100).toFixed(1)}%`}
                  valueClass={
                    node!.momentum.heatAcceleration > 0.1
                      ? "text-sky-400"
                      : node!.momentum.heatAcceleration < -0.1
                      ? "text-amber-400"
                      : "text-zinc-500"
                  }
                />
                {node!.momentum.predictedTransition && (
                  <TooltipRow
                    label="→ Pred."
                    value={node!.momentum.predictedTransition}
                    valueClass="text-indigo-400"
                  />
                )}
              </>
            )}
            <div className="border-t border-white/5 my-1.5" />
            <TooltipRow
              label="Pre-Warm"
              value={
                node!.prewarmTier === "DUAL"
                  ? "DUAL ★"
                  : node!.prewarmTier === "FULL"
                  ? "FULL"
                  : "—"
              }
              valueClass={
                node!.prewarmTier === "DUAL"
                  ? "text-indigo-400"
                  : node!.prewarmTier === "FULL"
                  ? "text-orange-400"
                  : "text-zinc-700"
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TooltipRow({
  label,
  value,
  valueClass = "text-zinc-300",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center text-[7px] font-bold uppercase">
      <span className="text-zinc-600">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC BOX
// ─────────────────────────────────────────────────────────────────────────────

function MetricBox({
  label,
  value,
  unit,
  icon,
  isAlert,
  isHighlight,
}: {
  label: string;
  value: any;
  unit: string;
  icon: React.ReactNode;
  isAlert?: boolean;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-[26px] border transition-all ${
        isAlert
          ? "border-red-500/40 bg-red-500/5"
          : isHighlight
          ? "border-sky-500/20 bg-sky-500/5"
          : "border-white/5 bg-zinc-900/25"
      }`}
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-600">
        {icon}
        <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black tracking-tighter text-white">{value}</span>
        <span className="text-[8px] font-black uppercase text-zinc-700">{unit}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-WARM STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

function PreWarmStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "orange" | "indigo" | "zinc";
}) {
  const colorMap = {
    orange: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    indigo: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    zinc: "text-zinc-600 border-white/5 bg-white/[0.02]",
  };
  return (
    <div
      className={`flex flex-col items-center justify-center py-3 rounded-xl border ${colorMap[color]}`}
    >
      <span className="text-lg font-black">{value}</span>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-60">
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLAG TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function FlagToggle({
  label,
  enabled,
  onToggle,
  isCritical,
}: {
  label: string;
  id?: string;
  enabled: boolean;
  onToggle: () => void;
  isCritical?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-2xl border ${
        isCritical
          ? "bg-red-500/5 border-red-500/20"
          : "bg-white/[0.03] border-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            enabled ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-zinc-700"
          }`}
        />
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${
            enabled ? "text-white" : "text-zinc-600"
          }`}
        >
          {label}
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`p-1.5 rounded-lg transition-colors ${
          enabled ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"
        }`}
      >
        {enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      </button>
    </div>
  );
}
