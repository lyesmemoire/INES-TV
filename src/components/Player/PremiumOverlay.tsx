"use client";

import React from "react";
import { Crown, Sparkles } from "lucide-react";

export default function PremiumOverlay({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 md:bottom-20 md:top-auto md:right-4 md:left-auto md:translate-x-0 z-40 animate-fade-in pointer-events-none">
      <div 
        className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto cursor-pointer hover:bg-black/80 transition-all hover:scale-105 active:scale-95 group"
        onClick={onUpgrade}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all">
          <Crown className="text-black" size={20} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-white font-black text-sm uppercase tracking-wider">Passer en Premium</p>
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <p className="text-zinc-400 text-xs mt-0.5 font-medium max-w-[200px]">Supprimez la publicité et débloquez la 4K.</p>
        </div>
      </div>
    </div>
  );
}
