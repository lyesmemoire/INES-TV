"use client";

import { useEffect, useState } from "react";
import StatCard from "@/src/components/Admin/StatCard";
import { 
  Users, 
  Tv2, 
  Zap, 
  ShieldAlert,
  ArrowUpRight,
  MonitorPlay,
  Activity
} from "lucide-react";

/**
 * 📊 ADMIN OPERATIONS DECK (Control Plane Home)
 * Main entry point for the StreamPerf OS management.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/saas/stats", {
          headers: { "x-admin-secret": "staff_emerge_key" } // Only for local demo, replace with real auth
        });
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Failed to sync stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      {/* HEADER: CONSOLE INFOS */}
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black tracking-tighter leading-none mb-2 text-white">Operations <span className="text-zinc-700">Deck</span></h2>
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">SaaS OS Kernel v1.0.4 • High Precision Mode</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition">Export Audit</button>
           <button className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition">Global Rerank</button>
        </div>
      </div>

      {/* METRICS GRID: THE PULSE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Reach" 
          value={stats?.users?.total || "---"} 
          trend="+12%" 
          trendType="up"
          icon={Users}
        />
        <StatCard 
          label="Premium Yield" 
          value={stats?.users?.premium || "---"} 
          subValue="Active Subscriptions"
          trend="+4.2%" 
          trendType="up"
          icon={Zap}
        />
        <StatCard 
          label="Active Streams" 
          value={stats?.streams?.active || "---"} 
          subValue="M3U Multi-CDN Hub"
          icon={MonitorPlay}
        />
        <StatCard 
          label="Panic Status" 
          value={stats?.system?.blackoutMode || "NORMAL"} 
          alert={stats?.system?.blackoutMode !== "NORMAL"}
          subValue="Global Blackout Override"
          icon={ShieldAlert}
        />
      </div>

      {/* ATTENTION ANALYTICS (WIP PREVIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-[#0F111A] border border-white/5 rounded-[40px] p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
            <Activity className="text-indigo-500/20 w-16 h-16 mb-4 animate-pulse" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Momentum Real-time Heatmap Loading...</p>
         </div>

         <div className="bg-[#0F111A] border border-white/5 rounded-[40px] p-8">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8">Recent Peak Events</h4>
            <div className="space-y-6">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                       <ArrowUpRight size={14} />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-white uppercase tracking-tighter">UCL: Real Madrid vs City</p>
                       <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Pressure Peak: 0.94 • 12m ago</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
