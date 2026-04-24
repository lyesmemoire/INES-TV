import React from 'react';

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Uptime", value: "99.99%", color: "text-emerald-400" },
        { label: "Concurrents", value: "10K+", color: "text-indigo-400" },
        { label: "Edge Latency", value: "< 15ms", color: "text-amber-400" },
        { label: "Security", value: "HMAC", color: "text-rose-400" },
      ].map((s, i) => (
        <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-black">{s.label}</p>
          <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
