"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, PieChart, RefreshCw, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

interface Metrics {
  mrr: number;
  arpu: number;
  ltv: number;
  churn: number;
  adsRevenue: number;
}

interface History {
  id: string;
  mrr: number;
  arpu: number;
  createdAt: string;
}

export default function AdminSaaSDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch("/api/admin/saas/stats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMetrics(data.live);
      setHistory(data.history || []);
      setLoading(false);
    } catch (err) {
      console.error("SaaS Stats Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000); // 1 min poll
    return () => clearInterval(id);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
        <RefreshCw className="animate-spin" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Aggrégation des données SaaS...</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      
      {/* ── Main KPIs ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialStatCard 
          title="MRR" 
          value={`€${metrics.mrr.toLocaleString()}`} 
          icon={<CreditCard className="text-emerald-400" />}
          trend="+12.4%"
          description="Revenu Mensuel Récurrent"
        />
        <FinancialStatCard 
          title="ARPU" 
          value={`€${metrics.arpu.toFixed(2)}`} 
          icon={<Users className="text-blue-400" />}
          trend="+3.2%"
          description="Revenu Moyen par Utilisateur"
        />
        <FinancialStatCard 
          title="LTV (EST)" 
          value={`€${metrics.ltv.toFixed(2)}`} 
          icon={<TrendingUp className="text-purple-400" />}
          trend="+8.1%"
          description="Lifetime Value"
        />
        <FinancialStatCard 
          title="Churn Rate" 
          value={`${metrics.churn.toFixed(2)}%`} 
          icon={<PieChart className="text-rose-400" />}
          trend="-0.5%"
          description="Taux d'Attrition"
          invertTrend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Trends Visualization (Simulated Sparklines) */}
        <div className="lg:col-span-2 bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                SaaS Growth (Snapshot)
              </h3>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Évolution des 10 dernières captures</p>
            </div>
          </div>

          <div className="h-64 flex items-end gap-2 px-2">
            {history.length > 0 ? (
              history.map((h, i) => (
                <div key={h.id} className="flex-1 group relative">
                  {/* Bar representing MRR value relative to max */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(h.mrr / Math.max(...history.map(x => x.mrr), 100)) * 100}%` }}
                    className="bg-emerald-500/20 group-hover:bg-emerald-500/40 rounded-t-lg transition-all border-t border-emerald-500/30"
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-zinc-900 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-white whitespace-nowrap pointer-events-none z-10">
                    €{h.mrr.toLocaleString()}
                    <br />
                    <span className="text-zinc-500">{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-600 font-bold tracking-widest text-[10px] uppercase">
                    Initialisation des tendances...
                </div>
            )}
          </div>
        </div>

        {/* Ads Revenue Breakdown comparison */}
        <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 space-y-8 h-fit">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                <DollarSign size={20} className="text-amber-500" />
                Ads Contribution
              </h3>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase italic">Revenu publicitaire total</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-black/40 border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">Cumulative Ad Earnings</p>
            <h2 className="text-5xl font-black text-white tracking-tighter relative z-10">
                €{metrics.adsRevenue.toLocaleString()}
            </h2>
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-amber-500 relative z-10 bg-amber-500/10 py-2 rounded-full border border-amber-500/20">
               <ArrowUpRight size={14} /> +4% vs last week
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FinancialStatCard({ title, value, icon, description, trend, invertTrend }: any) {
  const isUp = trend?.startsWith('+');
  const isPositive = invertTrend ? !isUp : isUp;

  return (
    <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-inner">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{title}</h4>
        <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
        <p className="text-[10px] text-zinc-600 font-bold uppercase">{description}</p>
      </div>
    </div>
  );
}
