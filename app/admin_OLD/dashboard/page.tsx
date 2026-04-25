"use strict";
"use client";

import { useEffect, useState } from "react";
import { 
  Users, TrendingUp, MousePointer2, Zap, ShieldCheck, Activity, Award
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from "next/link";

export default function AdminDashboard() {
  const [adsData, setAdsData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [rAds, rRev, rEng, rHealth] = await Promise.all([
              fetch("/api/admin/ads-summary", { headers }),
              fetch("/api/admin/revenue-summary", { headers }),
              fetch("/api/admin/user-engagement", { headers }),
              fetch("/api/admin/system-health", { headers })
            ]);

            if (!rAds.ok || !rRev.ok) throw new Error("Accès refusé. Veuillez vous reconnecter.");

            setAdsData(await rAds.json());
            setRevenueData(await rRev.json());
            setEngagementData(await rEng.json());
            setHealthData(await rHealth.json());
            
            setError(null);
            setLoading(false);
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;
  if (error || !revenueData) return <ErrorView error={error || "Data not loaded"} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
            <p className="text-xs text-zinc-500 font-medium">Monitoring global traffic & monetization</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/engine" 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all shadow-sm"
            >
              <Zap size={14} /> Open Stream Engine
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase">
                <Activity size={12} className="animate-pulse" /> Sys Status: {healthData?.status || "OK"}
            </div>
          </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={revenueData.totalUsers} icon={<Users size={16} />} />
          <StatCard title="Revenue (Today)" value={`€${revenueData.todayAdRevenue}`} icon={<TrendingUp size={16} />} growth="Live" />
          <StatCard title="Global Fill Rate" value={`${adsData.today.fillRate}%`} icon={<Activity size={16} />} />
          <StatCard title="Global CTR" value={`${adsData.today.globalCtr}%`} icon={<MousePointer2 size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE GRAPH */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800/50 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold">Revenue Timeline (7 Days)</h2>
                <div className="text-[10px] text-gray-500 uppercase font-black">€ EUR</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.graph}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4B5563" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`}/>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '12px' }} itemStyle={{ color: '#F9FAFB' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* DSP PERFORMANCE */}
        <div className="bg-[#111827] border border-gray-800/50 p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[420px] custom-scrollbar">
          <h2 className="text-lg font-bold mb-6">DSP Performance (Today)</h2>
          <div className="space-y-4">
            {adsData.providers.map((p: any) => (
              <div key={p.id} className="p-4 bg-[#1F2937] rounded-xl flex flex-col gap-2 border border-gray-700/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm uppercase text-gray-300">{p.provider}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400">
                    Fill: {p.fillRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Imps: <strong className="text-gray-200">{p.impressions}</strong></span>
                  <span>CTR: <strong className="text-white">{p.ctr}%</strong></span>
                </div>
              </div>
            ))}
            {adsData.providers.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">No active DSPs</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111827] border border-gray-800/50 p-6 rounded-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400"><Award size={18}/> Audience Value</h3>
              <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between p-3 bg-[#1F2937] rounded-lg">
                    <span>Average ARPU</span> <strong className="text-white">€{revenueData.arpu}</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1F2937] rounded-lg">
                    <span>Premium Subscribers</span> <strong className="text-white">{revenueData.premiumUsers}</strong>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1F2937] rounded-lg">
                    <span>Watch Time / User (24h)</span> <strong className="text-white">{engagementData.avgWatchTimeUser24hMins} min</strong>
                  </div>
              </div>
          </div>
          
          <div className="bg-[#111827] border border-gray-800/50 p-6 rounded-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-indigo-400"><ShieldCheck size={18}/> System Operations</h3>
               <div className="text-sm text-gray-400 space-y-3">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span>Aggregator Service</span> <span className="text-green-400">Up & Caching</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span>DB Target State</span> <span>Healthy</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Total Watch Hours (24h)</span> <strong className="text-white">{engagementData.totalWatchTime24hHours}h</strong>
                  </div>
               </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, growth }: any) {
  return (
    <div className="bg-[#111827] border border-gray-800/50 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400 font-semibold text-xs">
                {icon} {title}
            </div>
            {growth && <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-md">{growth}</span>}
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 blur-2xl rounded-full" />
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

function ErrorView({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl">⚠️ {error}</div>
      <button 
        onClick={() => window.location.href = "/admin/login"}
        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-all text-sm"
      >
        Retry / Login
      </button>
    </div>
  );
}
