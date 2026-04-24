"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Activity, Globe, Smartphone, Monitor, BrainCircuit, RefreshCw, ShieldOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface RevenueRecord {
  id: string;
  provider: string;
  cpm: number;
  country: string;
  device: string;
  createdAt: string;
}

export default function AdminAdsAI() {
  const { token } = useAuth();
  const [data, setData] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
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
      const res = await fetch("/api/admin/ads/revenue", {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (res.status === 401 || res.status === 403) {
        setIsNotAdmin(true);
        setLoading(false);
        return;
      }

      const json = await res.json();
      
      if (res.ok && Array.isArray(json)) {
        setData(json);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.warn("[Admin] Ads AI feed unavailable:", json.error || "Invalid response format");
        setData([]);
      }
    } catch (err) {
      console.warn("[Admin] Ads AI fetch skipped:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  if (isNotAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
        <ShieldOff className="text-amber-500" size={24} />
        <p className="font-bold uppercase tracking-widest text-[10px] text-amber-500">Accès Admin Requis</p>
      </div>
    );
  }

  const getCpmColor = (cpm: number) => {
    if (cpm >= 2.0) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (cpm >= 1.0) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toUpperCase()) {
      case "TV": return <Monitor size={14} />;
      case "MOBILE": return <Smartphone size={14} />;
      default: return <Globe size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Meta Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
            <BrainCircuit className="text-emerald-500" /> 
            AI Yield Performance
          </h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time Ground Truth Monitoring
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Last Update: {lastUpdate || "..."}
          </span>
          <button 
            onClick={() => fetchData()} 
            className="p-1 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Summary Grid (Micro) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Predictive Health", value: "98.2%", icon: Activity, color: "text-emerald-400" },
          { label: "Active Nodes", value: "12", icon: Globe, color: "text-blue-400" },
          { label: "AI Confidence", value: "High", icon: BrainCircuit, color: "text-purple-400" },
          { label: "Real-time CPM", value: `$${(data[0]?.cpm || 0).toFixed(2)}`, icon: TrendingUp, color: "text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} className="text-zinc-500" />
              <span className={`text-xs font-black uppercase tracking-tighter ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {data.map((row) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-zinc-800/40 ${getCpmColor(row.cpm)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-black text-white uppercase text-xs">
                  {row.provider.substring(0, 2)}
                </div>
                <div>
                  <p className="text-white font-black uppercase text-sm tracking-tighter">{row.provider}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 capitalize">
                      {getDeviceIcon(row.device)} {row.device.toLowerCase()}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                      <Globe size={10} /> {row.country}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-black tracking-tighter italic">
                  ${row.cpm.toFixed(4)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-0.5">
                  CPM VALUE
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {data.length === 0 && !loading && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
             <BrainCircuit size={48} className="mx-auto text-zinc-800 mb-4" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No AI Learning data recorded yet</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
