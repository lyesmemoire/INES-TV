"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  PieChart, 
  Activity, 
  CreditCard,
  Target,
  Zap,
  RefreshCw,
  ShieldOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Metrics {
  mrr: number;
  arpu: number;
  ltv: number;
  churn: number;
  adsRevenue: number;
  totalRevenue: number;
  cpm: number;
  revenueByGeo?: Record<string, number>;
}

export default function AdminRevenueDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotAdmin, setIsNotAdmin] = useState(false);

  // Prefer context token; fall back to localStorage for custom JWT
  const getToken = () => token || localStorage.getItem('token');

  const fetchData = async () => {
    const authToken = getToken();
    if (!authToken) {
      setIsNotAdmin(true);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/metrics", {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const json = await res.json();
      
      if (res.status === 401 || res.status === 403) {
        setIsNotAdmin(true);
        setData(null);
      } else if (res.ok) {
        setData(json);
      } else {
        console.warn("[Admin] Revenue metrics unavailable:", json.error);
        setData(null);
      }
    } catch (err) {
      console.warn("[Admin] Revenue fetch failed:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(id);
  }, [token]);

  if (loading && !data && !isNotAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
        <RefreshCw className="animate-spin text-emerald-500" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Calcul de la rentabilité réelle...</p>
      </div>
    );
  }

  if (isNotAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4 border border-white/5 bg-zinc-950/50 rounded-[2rem]">
        <ShieldOff className="text-amber-500" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px] text-amber-500">Accès Administrateur Requis</p>
        <p className="text-xs text-zinc-600 text-center max-w-xs">Connectez-vous avec un compte Admin pour voir les métriques financières.</p>
      </div>
    );
  }

  if (!data || (data as any).error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4 border border-white/5 bg-zinc-950/50 rounded-[2rem]">
        <Activity className="text-rose-500" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Données indisponibles ou accès restreint</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Safe accessor to handle potential missing numeric fields
  const safeNum = (val: any) => typeof val === 'number' ? val : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      
      {/* ── Main Performance Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <MetricCard 
          title="MRR" 
          value={`$${safeNum(data.mrr).toFixed(2)}`} 
          icon={<CreditCard size={20} />}
          description="Monthly Recurring Revenue"
          color="emerald"
        />
        
        <MetricCard 
          title="ARPU" 
          value={`$${safeNum(data.arpu).toFixed(2)}`} 
          icon={<Users size={20} />}
          description="Avg Revenue Per User"
          color="blue"
        />
        
        <MetricCard 
          title="LTV" 
          value={`$${safeNum(data.ltv).toFixed(2)}`} 
          icon={<Target size={20} />}
          description="Lifetime Value (Proj)"
          color="purple"
        />

        <MetricCard 
          title="Churn" 
          value={`${safeNum(data.churn).toFixed(2)}%`} 
          icon={<PieChart size={20} />}
          description="User Attrition Rate"
          color="rose"
        />

        <MetricCard 
          title="Ads Revenue" 
          value={`$${safeNum(data.adsRevenue).toFixed(2)}`} 
          icon={<Zap size={20} />}
          description="AdTech Yield Performance"
          color="amber"
        />

        <MetricCard 
          title="Total Revenue" 
          value={`$${safeNum(data.totalRevenue).toFixed(2)}`} 
          icon={<Activity size={20} />}
          description="Aggregated SaaS + Ads"
          color="indigo"
          isHighlight
        />

        <MetricCard 
          title="Global eCPM" 
          value={`$${safeNum(data.cpm).toFixed(2)}`} 
          icon={<DollarSign size={20} />}
          description="Avg Return per Mille"
          color="blue"
        />
      </div>

      {/* ── Visual Insight Panel ───────────────────────────── */}
      <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
              <TrendingUp className="text-emerald-500" />
              SaaS Performance Intelligence
            </h3>
            <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-1">Calculated via Proprietary Profit Engine</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
             <div className="flex flex-col items-end px-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Net Growth</span>
                <span className="text-sm font-black text-emerald-400 font-mono">+18.5%</span>
             </div>
             <div className="w-[1px] h-8 bg-white/10" />
             <RefreshCw 
               onClick={fetchData}
               className={`mx-3 text-zinc-500 cursor-pointer hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} 
               size={18} 
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Revenue Breakdown</h4>
                <div className="space-y-4">
                    <ProgressBar label="SaaS Subscriptions" percent={data.totalRevenue > 0 ? (safeNum(data.mrr) / data.totalRevenue) * 100 : 0} color="emerald" />
                    <ProgressBar label="Ads Monetization" percent={data.totalRevenue > 0 ? (safeNum(data.adsRevenue) / data.totalRevenue) * 100 : 0} color="amber" />
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center justify-between">
                  <span>Geographic Yield</span>
                  <span className="text-emerald-500 font-bold">eCPM 🌐</span>
                </h4>
                <div className="space-y-4">
                    {data.revenueByGeo && Object.entries(data.revenueByGeo)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([country, rev], idx) => (
                        <div key={country} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                             <span>{country}</span>
                             <span>${(rev as number).toFixed(2)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(5, ((rev as number) / safeNum(data.adsRevenue)) * 100))}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                              className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-indigo-500/50'}`}
                            />
                          </div>
                        </div>
                      ))
                    }
                    {(!data.revenueByGeo || Object.keys(data.revenueByGeo).length === 0) && (
                      <p className="text-xs text-zinc-600 italic">No geographic data yet.</p>
                    )}
                </div>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full" />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">Estimated Annual Run Rate</p>
                <h2 className="text-4xl font-black text-white text-center tracking-tighter italic">
                    ${(safeNum(data.totalRevenue) * 12).toLocaleString()}
                </h2>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description, color, isHighlight }: any) {
  const colorMap: any = {
    emerald: "text-emerald-400 group-hover:text-emerald-300",
    blue: "text-blue-400 group-hover:text-blue-300",
    purple: "text-purple-400 group-hover:text-purple-300",
    rose: "text-rose-400 group-hover:text-rose-300",
    amber: "text-amber-400 group-hover:text-amber-300",
    indigo: "text-indigo-400 group-hover:text-indigo-300",
  };

  const bgMap: any = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    blue: "bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    purple: "bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
    rose: "bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    amber: "bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    indigo: "bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative group p-8 rounded-[2rem] border transition-all duration-500 shadow-2xl backdrop-blur-xl ${
        isHighlight 
          ? 'bg-zinc-900/80 border-white/20' 
          : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-900/60'
      }`}
    >
      <div className={`absolute -right-4 -top-4 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full bg-${color}-500`} />
      
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl shadow-inner transition-colors duration-500 ${bgMap[color]}`}>
          {React.cloneElement(icon, { className: colorMap[color] })}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
        <p className={`text-3xl font-black tracking-tighter ${isHighlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500' : 'text-white'}`}>
          {value}
        </p>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{description}</p>
      </div>
    </motion.div>
  );
}

function ProgressBar({ label, percent, color }: any) {
  const barColors: any = {
    emerald: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    amber: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <span>{label}</span>
        <span className="text-white">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${barColors[color]}`}
        />
      </div>
    </div>
  );
}
