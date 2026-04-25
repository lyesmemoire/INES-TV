'use client';

import { useEffect, useState } from 'react';
import { 
  Zap, 
  Activity, 
  Cpu, 
  AlertOctagon, 
  Search, 
  Clock, 
  Users, 
  MonitorPlay,
  Play,
  Square
} from 'lucide-react';

export default function EnginePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inspectUser, setInspectUser] = useState('');
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/admin/engine/metrics");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Metrics fetch failed", e);
    }
  }

  async function toggleKill() {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${data?.status === 'RUNNING' ? 'ARRÊTER' : 'DÉMARRER'} le système de streaming ?`)) return;
    
    setLoading(true);
    try {
      await fetch("/api/admin/engine/kill", { method: "POST" });
      await fetchMetrics();
    } catch (e) {
      alert("Échec du basculement du Kill Switch");
    } finally {
      setLoading(false);
    }
  }

  async function handleInspect() {
    if (!inspectUser) return;
    try {
      const res = await fetch(`/api/admin/engine/inspect/${inspectUser}`);
      const json = await res.json();
      setInspectResult(json.data);
    } catch (e) {
      setInspectResult(null);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  const isStopped = data.status !== 'RUNNING';

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* 🚀 NOC HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-indigo-500" size={24} />
            <h1 className="text-3xl font-black tracking-tighter">NOC ENGINE</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <Clock size={14} /> Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={toggleKill}
            disabled={loading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-widest transition-all ${
              isStopped
                ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            } disabled:opacity-50`}
          >
            {isStopped ? <Play size={18} fill="currentColor" /> : <Square size={18} fill="currentColor" />}
            {isStopped ? "START SYSTEM" : "STOP GLOBAL"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 📊 KPI ROW */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <KPICard 
            title="System Status" 
            value={data.status} 
            icon={<Activity size={18} className={isStopped ? "text-rose-500" : "text-emerald-500 animate-pulse"} />}
            trend={isStopped ? "Maintenance" : "Optimal"}
            trendUp={!isStopped}
          />
          <KPICard 
            title="Active Users" 
            value={data.totalUsers} 
            icon={<Users size={18} className="text-indigo-400" />}
            trend="Live Traffic"
          />
          <KPICard 
            title="Sources" 
            value={data.sources.length} 
            icon={<MonitorPlay size={18} className="text-amber-400" />}
            trend="Active Cluster"
          />
          <KPICard 
            title="Uptime" 
            value={`${Math.floor(data.system.uptime / 60)}m ${Math.floor(data.system.uptime % 60)}s`} 
            icon={<Cpu size={18} className="text-slate-400" />}
            trend="Process Stable"
          />
        </div>

        {/* 📡 SOURCE LOADS */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl">
            <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Regional Source Load
            </h2>

            <div className="space-y-8">
              {data.sources.map((s: any) => {
                const percentage = Math.round(s.load); // In reality should be (s.load / maxUsers) * 100
                return (
                  <div key={s.id} className="group">
                    <div className="flex justify-between items-end mb-3 px-1">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{s.region || "Global"}</span>
                        <span className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{s.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-indigo-400">{s.load}</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">conns</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3 overflow-hidden p-[2px]">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {data.sources.length === 0 && (
                <div className="text-center py-10">
                   <p className="text-slate-600 text-sm font-medium">Aucune source active détectée par le Load Balancer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔍 INSPECTOR & TOOLS */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Search size={18} className="text-indigo-500" /> Stream Inspector
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-tight">Vérifier l'état d'un utilisateur spécifique</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Target UserId..."
                value={inspectUser}
                onChange={(e) => setInspectUser(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                onClick={handleInspect}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Go
              </button>
            </div>

            {inspectResult && (
              <div className="mt-6 p-4 bg-slate-950 border border-indigo-500/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase">Session Found</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2 text-xs">
                   <div className="flex justify-between"><span className="text-slate-500">Source:</span> <span className="text-white font-bold">{inspectResult.sourceId}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Uptime:</span> <span className="text-white font-bold">{Math.floor((Date.now() - inspectResult.startedAt)/1000)}s</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
            <h2 className="text-lg font-bold text-rose-500 mb-4 flex items-center gap-2">
              <AlertOctagon size={18} /> Danger Zone
            </h2>
            <p className="text-xs text-slate-500 mb-4">Ces actions impactent globalement l'ensemble des clusters de diffusion.</p>
            <button 
              className="w-full py-2 border border-rose-500/40 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-500/10 transition-all uppercase tracking-widest"
              onClick={() => {
                const confirmed = window.confirm("Action critique : réinitialiser TOUS les compteurs de charge ?");
                if (confirmed) alert("Reset triggers (implémentation backend requise)");
              }}
            >
              Reset Cluster Loads
            </button>
          </div>

        </div>

      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900/50 text-center">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">StreamPerf NOC Console v4.2 // Internal Use Only</p>
      </footer>
    </div>
  );
}

function KPICard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-950 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${trendUp === false ? "text-rose-500" : "text-slate-500"}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none mb-1">{title}</h3>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
