import React from 'react';

export default function ArchDiagram() {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center max-w-full">
        <div className="bg-slate-800 border-2 border-indigo-500 px-6 py-3 rounded-lg text-indigo-100 font-bold w-64 text-center z-10 relative shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          Player (Client)
        </div>
        <div className="h-8 w-1 bg-slate-700 animate-pulse"></div>
        <div className="bg-slate-800 border-2 border-emerald-500 px-6 py-3 rounded-lg text-emerald-100 font-bold w-64 text-center z-10 relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          Cloudflare CDN Edge Worker
        </div>
        <div className="h-8 w-1 bg-slate-700"></div>
        <div className="flex gap-4">
          <div className="bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-slate-300 text-sm w-32 text-center relative z-10">
            Node FRA (EU)
          </div>
          <div className="bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-slate-300 text-sm w-32 text-center relative z-10">
            Node IAD (US)
          </div>
        </div>
        <div className="mt-8 text-xs text-slate-500 italic max-w-sm text-center">
          * Les requêtes sont filtrées par un token HMAC à expiration. Les segments .ts sont réécrits dynamiquement à la volée.
        </div>
      </div>
    </div>
  );
}
