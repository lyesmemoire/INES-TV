"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Settings, 
  Plus, 
  BarChart3, 
  Zap, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

/**
 * 💰 ADX STUDIO & CONTROL HUB
 * Centralized control for Sacred Zones and Panic Modes.
 */
export default function AdminAdsPage() {
  const [houseAds, setHouseAds] = useState<any[]>([]);
  const [panicMode, setPanicMode] = useState<string>("NORMAL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [adsRes, statRes] = await Promise.all([
          fetch("/api/admin/saas/ads/house", { headers: { "x-admin-secret": "staff_emerge_key" } }),
          fetch("/api/admin/saas/stats", { headers: { "x-admin-secret": "staff_emerge_key" } })
        ]);
        const adsData = await adsRes.json();
        const statData = await statRes.json();
        setHouseAds(adsData);
        setPanicMode(statData.system.blackoutMode);
      } catch (e) {
        console.error("Fetch failed");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePanicToggle = async (mode: string) => {
    setPanicMode(mode);
    await fetch("/api/admin/saas/system/panic", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": "staff_emerge_key" },
      body: JSON.stringify({ mode })
    });
  };

  return (
    <div className="space-y-12">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tighter text-white">AdX <span className="text-zinc-700">Studio</span></h2>
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Sacred Mode Orchestration & Blackout Controls</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-95 transition">
           <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* 🚨 PANIC MODE CONTROL CENTER */}
      <section className="bg-[#0F111A] border border-white/5 rounded-[48px] p-10 relative overflow-hidden">
         {/* Background Danger Glow */}
         {panicMode !== "NORMAL" && (
           <div className={`absolute inset-0 opacity-[0.03] blur-[120px] ${panicMode === "EXTREME" ? "bg-red-500" : "bg-orange-500"}`} />
         )}

         <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className={panicMode === "EXTREME" ? "text-red-500" : "text-zinc-500"} />
                  <h3 className="text-xl font-black tracking-tighter text-white uppercase">Panic Mode Control</h3>
               </div>
               <p className="text-zinc-500 text-[11px] leading-relaxed max-w-sm mb-8">
                  Hybrid blackout system. {panicMode === "EXTREME" ? "🔴 System currently in HARD LOCKDOWN." : "⚪ System operating normally."} Change the state to instantly propagate blackout rules via Redis.
               </p>
               
               <div className="flex gap-4">
                  {["NORMAL", "LIGHT", "EXTREME"].map(mode => (
                    <button 
                      key={mode}
                      onClick={() => handlePanicToggle(mode)}
                      className={`
                        px-8 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all
                        ${panicMode === mode 
                          ? (mode === "EXTREME" ? "bg-red-600 text-white" : mode === "LIGHT" ? "bg-orange-600 text-white" : "bg-indigo-600 text-white") 
                          : "bg-white/5 text-zinc-500 hover:bg-white/10"}
                      `}
                    >
                      {mode}
                    </button>
                  ))}
               </div>
            </div>

            <div className="lg:w-96 p-8 bg-black/40 rounded-[32px] border border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Thresholds</span>
                   <Settings size={14} className="text-zinc-600" />
                </div>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black text-white uppercase">Sacred Zone Entry</span>
                        <span className="text-[9px] font-black text-indigo-500">0.85 P</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="w-[85%] h-full bg-indigo-600" />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black text-white uppercase">Blackout Threshold</span>
                        <span className="text-[9px] font-black text-red-500">0.92 P</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="w-[92%] h-full bg-red-600" />
                      </div>
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* HOUSE ADS INVENTORY */}
      <section>
         <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-indigo-500" size={20} />
            <h3 className="text-xl font-black tracking-tighter text-white uppercase">Sacred Inventory (House Ads)</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-44 bg-zinc-900/50 rounded-[40px] animate-pulse" />)
           ) : houseAds.length > 0 ? (
             houseAds.map(ad => (
               <div key={ad.id} className="bg-[#0F111A] border border-white/5 rounded-[40px] p-8 group hover:border-indigo-500/30 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <div className="px-3 py-1.5 bg-indigo-500/10 rounded-xl text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                       Priority: {ad.priority}
                    </div>
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-black tracking-tighter text-white mb-4 leading-tight">{ad.name}</h4>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                     <span>Range: {ad.minPressure} - {ad.maxPressure}</span>
                     <span>•</span>
                     <span className="text-emerald-500">Active</span>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[48px]">
                <AlertTriangle className="mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No House Ads Configured • Fallback Active</p>
             </div>
           )}
         </div>
      </section>
    </div>
  );
}
