"use client";

import React, { useEffect, useState } from "react";
import { Activity, BarChart3, RefreshCw, Clock, Save, Power, DollarSign, Zap, AlertTriangle, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminAdsAI from "./AdminAdsAI";
import { useAuth } from "../../context/AuthContext";

export default function AdminAdsDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isNotAdmin, setIsNotAdmin] = useState(false);
  
  // Config state
  const [config, setConfig] = useState<any>(null);
  const [savingFreq, setSavingFreq] = useState(false);

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
      const [sRes, cRes, aRes] = await Promise.all([
        fetch("/api/admin/ads/stats", { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch("/api/admin/ads/config", { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch("/api/admin/ads/alerts", { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);

      if (sRes.status === 401 || sRes.status === 403) {
        setIsNotAdmin(true);
        setLoading(false);
        return;
      }

      const sData = sRes.ok ? await sRes.json() : null;
      const cData = cRes.ok ? await cRes.json() : null;
      const aData = aRes.ok ? await aRes.json() : { alerts: [] };
      
      setStats(sData);
      setConfig(cData);
      setAlerts(aData.alerts || []);
    } catch (e) {
      console.warn("[Admin] Ads dashboard fetch skipped:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, [token]);

  const handleToggleProvider = async (id: string, currentStatus: boolean) => {
    const authToken = getToken();
    try {
      await fetch(`/api/admin/ads/providers/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      fetchData();
    } catch (e) {}
  };

  const handleUpdateFrequency = async () => {
    setSavingFreq(true);
    const authToken = getToken();
    try {
      await fetch(`/api/admin/ads/frequency`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
        body: JSON.stringify({ seconds: parseInt(config.frequency) })
      });
      setTimeout(() => setSavingFreq(false), 500);
    } catch (e) {
      setSavingFreq(false);
    }
  };

  if (loading && !stats && !isNotAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
        <RefreshCw className="animate-spin" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Lancement du Sentinel Watchdog...</p>
      </div>
    );
  }

  if (isNotAdmin || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4 border border-white/5 bg-zinc-950/50 rounded-[2rem]">
        <ShieldOff className="text-amber-500" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px] text-amber-500">Accès Administrateur Requis</p>
        <p className="text-xs text-zinc-600 text-center max-w-xs">Connectez-vous avec un compte Admin pour voir les données publicitaires.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
      
      {/* ── Alerts & Notifications (Ad Sentinel) ───────────────────────────── */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-4">
               {alerts.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 text-red-400">
                    <div className="bg-red-500 p-2 rounded-xl text-black">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black uppercase tracking-tight">{a.type} ALERT: {a.msg}</h4>
                      <p className="text-[10px] opacity-70 underline uppercase font-bold">{new Date(a.timestamp).toLocaleTimeString()}</p>
                    </div>
                    {a.provider && (
                      <button 
                        onClick={() => {/* Focus on provider */}}
                        className="text-[10px] font-black uppercase px-4 py-2 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-all font-mono"
                      >
                        Inspect {a.provider}
                      </button>
                    )}
                  </div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Earnings (EST)" 
          value={`$${stats.earnings || '0.00'}`} 
          icon={<DollarSign className="text-emerald-400" />}
          description="Revenus estimés"
        />
        <StatCard 
          title="Avg CPM" 
          value={`$${stats.avgCpm || '0.00'}`} 
          icon={<Zap className="text-amber-400" />}
          description="Performance par 1k"
        />
        <StatCard 
          title="Fill Rate" 
          value={(stats.fillRate || '0') + "%"} 
          icon={<BarChart3 className="text-indigo-400" />}
          description="Efficacité AI"
        />
        <StatCard 
          title="Total Requests" 
          value={stats.requests?.toLocaleString() || '0'} 
          icon={<Activity className="text-zinc-400" />}
          description="Flux entrant"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gemini AI Selector */}
        <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 space-y-8 h-fit">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                <Zap size={20} className="text-indigo-500" />
                Gemini AI Selector
              </h3>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase italic">Propulsé par Google Gemini 1.5 Flash</p>
            </div>
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase rounded-full border border-indigo-500/20 flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]" />
              Machine Learning Active
            </div>
          </div>

          <div className="space-y-4">
            {config?.providers ? (
              config.providers.map((p: any, i: number) => (
                <div key={p.id || i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] hover:border-white/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${p.active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-500'}`}>
                      {p.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase">{p.name || 'Unknown Provider'}</h4>
                        {i === 0 && p.active && (
                          <span className="bg-indigo-500/10 text-indigo-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase border border-indigo-500/20">Yield Optimisé</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold truncate max-w-[150px] mt-0.5">{p.baseUrl || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <button 
                      onClick={() => handleToggleProvider(p.id, p.active)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${p.active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-500 grayscale'}`}
                    >
                      <Power size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-600 text-xs font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                No providers configured
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Frequency + Real-time Feed */}
        <div className="space-y-8">
          <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" />
                  Fréquence Pub
                </h3>
                <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Ratio Profit / Rétention</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-4xl font-black text-white">{config?.frequency ? Math.floor(config.frequency / 60) : 0}</span>
                  <span className="text-sm font-black text-zinc-500 uppercase ml-2">Minutes</span>
                </div>
                <button 
                  onClick={handleUpdateFrequency}
                  disabled={savingFreq || !config}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {savingFreq ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </div>
              <input 
                type="range" 
                min="60" 
                max="3600" 
                step="60"
                value={config?.frequency || 900}
                onChange={(e) => setConfig(config ? { ...config, frequency: parseInt(e.target.value) } : null)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* AI Real-time Feed (Phase 18) */}
          <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8">
            <AdminAdsAI />
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: any) {
  return (
    <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-inner">
          {icon}
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
