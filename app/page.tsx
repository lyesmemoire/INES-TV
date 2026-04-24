"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import HeroMatchCard from "@/src/components/Admin/HeroMatchCard";

/**
 * 📁 /app/page.tsx
 * SENTIENT SPORTS ATTENTION OS (v1.0 Production)
 * 
 * Features:
 * - Real-time Socket.io Sync
 * - Server-Driven Layout Plan
 * - Sacred Zone Blackout logic
 * - Sentient Visual Evolution (Pulse/Glow/Shake)
 */

type FeedItem =
  | { type: "match"; id: string; data: any }
  | { type: "featured"; id: string; data: any }
  | { type: "ad"; subType: string; data: any };

export default function SentientHomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. INITIAL HYDRATION
  const fetchLayout = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/feed/home");
      const data = await res.json();
      if (data.items) setFeed(data.items);
    } catch (e) {
      console.error("Layout fetch failed", e);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLayout();

    // 2. REAL-TIME ORCHESTRATION
    const socket = io({ transports: ["websocket"] });

    socket.on("feed:update", (update: any) => {
      console.log("🏆 Global re-rank received");
      if (update.items) setFeed(update.items);
    });

    socket.on("match:event", (event: any) => {
      if (event.type === "goal") {
        console.log("⚽ GOAL! Triggering layout refresh...");
        fetchLayout();
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* 🟢 NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5 py-5 px-6">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">OS</div>
             <span className="text-xl font-black tracking-tighter uppercase italic">Stream<span className="text-indigo-500">Perf</span></span>
          </div>
          <div className="flex items-center gap-4">
             {isSyncing && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />}
             <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition">Kernel Hub</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto py-10 px-4">
        
        {/* HEADER SECTION */}
        <div className="flex items-end justify-between mb-12 px-2">
           <div>
              <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">Attention <span className="text-zinc-700">OS</span></h1>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Real-time Deterministic Ranking</p>
           </div>
           <div className="text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/5 rounded-full">
                 <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Live Engine Active</span>
              </div>
           </div>
        </div>

        {/* FEED RENDERER */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
               Array(3).fill(0).map((_, i) => (
                 <div key={i} className="h-48 bg-zinc-900/50 rounded-[40px] animate-pulse border border-white/5" />
               ))
            ) : feed.map((item, idx) => (
              <motion.div
                key={item.type === "match" ? item.id : `ad-${idx}`}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {item.type === "featured" ? (
                   <HeroMatchCard match={item.data} />
                ) : item.type === "match" ? (
                  <MatchCard match={item.data} />
                ) : (
                  <AdCard ad={item.data} isHouse={item.subType === "house"} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLoading && feed.length === 0 && (
             <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">OS Static • No Attention Peaks Detected</p>
             </div>
          )}
        </div>
      </main>

      <footer className="max-w-xl mx-auto py-20 px-6 text-center border-t border-white/5 mt-10">
         <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">StreamPerf Industrial Media Layer • v1.0.0-PRO</p>
      </footer>
    </div>
  );
}

/**
 * 📺 SENTIENT MATCH CARD
 * Evolves with Pressure Index
 */
function MatchCard({ match }: any) {
  const p = match.pressureIndex || 0;
  const isHigh = p > 0.8;
  const isSacred = p > 0.92;
  const isWarm = match.liveness === "WARM";

  return (
    <div className={`
      relative bg-[#0A0A0A] border rounded-[44px] p-8 group transition-all duration-700
      ${isHigh ? 'border-indigo-500/40 shadow-[0_0_40px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/20' : 'border-white/5'}
      ${isWarm ? 'opacity-30 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}
    `}>
      {/* MOMENTUM GLOW */}
      {isHigh && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-600/10 blur-[100px] pointer-events-none" 
        />
      )}

      {/* CARD HEADER */}
      <div className="flex justify-between items-center mb-10 relative z-10">
         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 bg-white/5 px-3 py-1.5 rounded-xl">
           {match.league || "Unknown League"}
         </span>
         <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${match.liveness === "HOT" ? 'bg-indigo-500 animate-[pulse_0.6s_infinite] shadow-[0_0_10px_#6366f1]' : 'bg-zinc-700'}`} />
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
              {match.liveness === "HOT" ? "Hot Momentum" : "Warm Pulse"}
            </span>
         </div>
      </div>

      {/* CENTER SCOREBOARD */}
      <div className="flex items-center justify-between relative z-10 text-center">
         <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-3xl mb-3 flex items-center justify-center font-black text-xl text-zinc-700">
               {match.homeName?.charAt(0) || "H"}
            </div>
            <div className="text-[11px] font-black uppercase tracking-tighter">{match.homeName}</div>
         </div>

         <div className="px-6 flex flex-col items-center">
            <motion.div 
              key={match.score}
              initial={{ scale: 1.4, filter: "brightness(2)" }}
              animate={{ scale: 1, filter: "brightness(1)" }}
              className={`text-5xl font-black tracking-tighter ${isSacred ? 'text-red-500' : 'text-white'}`}
            >
               {match.score}
            </motion.div>
            <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-2">
               Pressure: {(p * 100).toFixed(0)}%
            </div>
         </div>

         <div className="flex-1">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-3xl mb-3 flex items-center justify-center font-black text-xl text-zinc-700">
               {match.awayName?.charAt(0) || "A"}
            </div>
            <div className="text-[11px] font-black uppercase tracking-tighter">{match.awayName}</div>
         </div>
      </div>

      {/* PRESSURE INDICATOR BAR */}
      <div className="mt-12 h-1 bg-white/5 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${p * 100}%` }}
           className={`h-full ${isHigh ? 'bg-indigo-500' : 'bg-zinc-700'}`}
         />
      </div>

      <div className="mt-8">
         <Link href={`/watch/${match.id}`} className={`
            block w-full text-center py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] transition-all
            ${isHigh ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-black hover:bg-indigo-600 hover:text-white'}
         `}>
            Enter Stadium
         </Link>
      </div>
    </div>
  );
}

/**
 * 💰 ADX RENDERER
 */
function AdCard({ ad, isHouse }: { ad: any, isHouse: boolean }) {
  return (
    <div className={`
      relative border rounded-[44px] p-10 overflow-hidden group transition-all duration-500
      ${isHouse ? 'bg-zinc-900/30 border-white/10' : 'bg-[#0A0A0A] border-indigo-500/20 shadow-xl shadow-indigo-500/5'}
    `}>
      <div className="relative z-10">
         <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
               {isHouse ? "StreamPerf Prime" : "Premium Insight"}
            </span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Sponsored Zone</span>
         </div>
         
         <h3 className="text-2xl font-black tracking-tight leading-[0.95] mb-8 max-w-[260px]">
            {isHouse ? "Experience the Future of Sports Media" : (ad.creative || "Exclusive Advantage Program")}
         </h3>

         <button className="bg-indigo-600 hover:bg-white hover:text-black text-white text-[10px] font-black px-10 py-5 rounded-[22px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
            {isHouse ? "Upgrade Account" : "Access Now"}
         </button>
      </div>

      <div className="absolute top-0 right-0 p-12 text-7xl opacity-[0.03] select-none pointer-events-none -rotate-12 transition-all duration-700 group-hover:opacity-10 group-hover:scale-110">
         {isHouse ? "💎" : "⚡"}
      </div>
    </div>
  );
}
