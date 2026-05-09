"use client";

import React, { useState } from "react";

export default function MatchForm() {
  const [match, setMatch] = useState<any>({
    isFeatured: false,
    featuredOrder: "",
    featuredUntil: "",
    pinnedUntil: "",
    featuredLocale: ""
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-8">
      <div className="border-b border-zinc-800 pb-6">
        <h2 className="text-2xl text-white font-bold tracking-tight">Configuration du Match</h2>
        <p className="text-zinc-500 mt-1">Les champs de base du match sont en construction.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
          ⭐ Featured Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={match.isFeatured} 
              onChange={(e) => setMatch({...match, isFeatured: e.target.checked})}
              className="w-5 h-5 accent-emerald-500 rounded bg-zinc-800 border-zinc-700"
            />
            <span className="text-white font-semibold">Featured (À la une)</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-400 uppercase">Featured Order</span>
            <input 
              type="number" 
              min="1" max="3" 
              value={match.featuredOrder}
              onChange={(e) => setMatch({...match, featuredOrder: e.target.value})}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-400 uppercase">Featured Until (Auto Expiration)</span>
            <input 
              type="datetime-local" 
              value={match.featuredUntil}
              onChange={(e) => setMatch({...match, featuredUntil: e.target.value})}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-yellow-500 uppercase">Pin Until (Top Priority)</span>
            <input 
              type="datetime-local" 
              value={match.pinnedUntil}
              onChange={(e) => setMatch({...match, pinnedUntil: e.target.value})}
              className="bg-zinc-800 border border-yellow-500/50 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-500 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-400 uppercase">Featured Locale</span>
            <select 
              value={match.featuredLocale}
              onChange={(e) => setMatch({...match, featuredLocale: e.target.value})}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Global (Toutes langues)</option>
              <option value="fr">Français (FR)</option>
              <option value="en">Anglais (EN)</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
