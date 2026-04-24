"use client";

import React, { useEffect, useState } from "react";
import { PlayerStats } from "../UltraPlayer";

interface StatsForNerdsProps {
  getStats: () => PlayerStats;
  isOpen: boolean;
}

export default function StatsForNerds({ getStats, isOpen }: StatsForNerdsProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [history, setHistory] = useState<number[]>(new Array(20).fill(0));

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      const s = getStats();
      setStats(s);
      setHistory(prev => [...prev.slice(1), s.bitrate]);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, getStats]);

  if (!isOpen || !stats) return null;

  const getCdnColor = (cdn: string) => {
    if (cdn.includes("CLOUDFLARE")) return "text-orange-400";
    if (cdn.includes("AWS")) return "text-yellow-400";
    if (cdn.includes("BUNNY")) return "text-pink-400";
    return "text-emerald-400";
  };

  // Generate SVG path for bitrate history
  const pathData = history.map((val, i) => {
    const x = (i / (history.length - 1)) * 200;
    const y = 40 - (Math.min(val / 15, 1) * 30); // Max 15Mbps for scale
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="absolute top-20 right-6 z-[60] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 shadow-2xl pointer-events-none select-none font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Technical Readout</h4>
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      </div>

      <div className="space-y-2.5">
        <StatRow label="Active CDN" value={stats.cdn} valueClass={getCdnColor(stats.cdn)} />
        <StatRow label="Bitrate" value={`${stats.bitrate} Mbps`} />
        
        {/* BITRATE WAVEFORM */}
        <div className="h-10 w-full bg-white/5 rounded-lg overflow-hidden relative border border-white/5">
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" className="transition-all duration-1000" />
           </svg>
           <div className="absolute top-1 right-1 text-[7px] text-white/20 uppercase font-bold">15 Mbps</div>
        </div>

        <StatRow label="Resolution" value={stats.resolution} />
        <StatRow label="Zapping Speed" value={`${stats.zappingLatency}ms`} valueClass="text-emerald-400" />
        <StatRow label="Buffer Health" value={`${Number(stats.buffer).toFixed(1)}s`} />
        <StatRow label="Latency" value={`${stats.latency}ms`} />
        <StatRow label="Dropped Frames" value={stats.droppedFrames.toString()} valueClass={stats.droppedFrames > 0 ? "text-red-400" : ""} />
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-1000" 
            style={{ width: `${Math.min((stats.buffer / 60) * 100, 100)}%` }} 
          />
        </div>
        <div className="flex justify-between mt-1.5">
           <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">Buffer Engine</p>
           <p className="text-[7px] text-emerald-400/60 uppercase font-black tracking-widest">{Math.round(Math.min((stats.buffer / 60) * 100, 100))}% Capacity</p>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, valueClass = "text-white" }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="text-white/40 font-bold uppercase">{label}</span>
      <span className={`font-black ${valueClass}`}>{value}</span>
    </div>
  );
}
