"use client";

import { motion } from "framer-motion";
import { Zap, Tv2, Radio } from "lucide-react";

/**
 * 🏆 HERO MATCH CARD
 * High-impact design for Editorial Featured slots.
 * Features a vibrant Noir/Indigo/Emerald gradient.
 */
export default function HeroMatchCard({ match }: { match: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full overflow-hidden rounded-[32px] mb-8 group cursor-pointer border-2 border-emerald-400/20 hover:border-emerald-400 transition-colors duration-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
    >
      {/* LIVE PULSE BORDER */}
      <motion.div 
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 border-[4px] border-emerald-400/20 rounded-[32px] pointer-events-none"
      />
      {/* GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-500 transition-transform duration-700 group-hover:scale-105" />
      
      {/* NOISE/GLOW OVERLAY */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20" />

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
           <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                 <Zap size={12} className="text-white fill-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">Editorial Hero Match</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40">
                 <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Power</span>
              </div>
           </div>

           <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
                {match.homeName} <span className="text-white/40">vs</span> {match.awayName}
              </h2>
              <p className="text-sm font-bold text-white/60 mt-3 uppercase tracking-widest">
                {match.league} • {match.status}
              </p>
           </div>
        </div>

        <div className="flex items-center gap-6 md:gap-12">
            {/* MATCH SCORE / STATUS */}
            <div className="text-center">
               <div className="text-5xl md:text-7xl font-black tracking-tighter text-white tabular-nums drop-shadow-2xl">
                 {match.score || "0 - 0"}
               </div>
               <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Feed</span>
               </div>
            </div>

            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-zinc-100 transition active:scale-95">
               Watch Now
            </button>
        </div>
      </div>
      
      {/* BOTTOM FOOTER */}
      <div className="relative z-10 px-10 py-4 bg-black/10 border-t border-white/5 flex items-center gap-4">
         <Radio size={14} className="text-white/60" />
         <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Streaming via Facebook Live + Multi-CDN Hub</span>
      </div>
    </motion.div>
  );
}
