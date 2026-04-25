"use client";

import { useEffect, useState } from "react";
import StatCard from "@/src/components/Admin/StatCard";
import { 
  Tv2, 
  Zap, 
  Activity,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Users as UsersIcon,
  Home
} from "lucide-react";
import Link from "next/link";
import MatchForm from "@/src/components/Admin/MatchForm";
import { Channel } from "@/src/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    live: 5,
    upcoming: 12,
    users: "1.2k",
    premium: 350
  });
  const [liveMatches, setLiveMatches] = useState<Channel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Mocking live matches for the demo as per request
    setLiveMatches([
      {
        id: "1",
        name: "PSG vs OM",
        category: "football",
        status: "LIVE",
        viewers: "45.2k",
        logo: "",
        score: "2-1",
        streamSources: [
          { id: "1", type: "facebook", url: "https://fb.watch/...", priority: 1, isActive: true, status: "valid" },
          { id: "2", type: "m3u8", url: "https://cdn.com/...", priority: 2, isActive: true, status: "valid" },
          { id: "3", type: "mp4", url: "", priority: 3, isActive: false, status: "invalid" }
        ]
      }
    ]);
  }, []);

  return (
    <div className="space-y-10 relative">
      {/* OVERLAY FORM */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <MatchForm 
            onCancel={() => setShowAddForm(false)} 
            onSave={(data) => {
              console.log("Saving match...", data);
              setShowAddForm(false);
            }} 
          />
        </div>
      )}

      {/* HEADER: CONSOLE INFOS */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
           <div>
              <h2 className="text-3xl font-black tracking-tighter leading-none mb-2 text-white">Admin <span className="text-zinc-700">Dashboard</span></h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Operational Oversight • Live Node Matrix</p>
           </div>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition"
        >
          <Plus size={16} /> Ajouter un nouveau match
        </button>
      </div>

      {/* 📊 STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F111A] border border-white/5 rounded-3xl p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                 <Activity size={18} />
              </div>
              <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-md uppercase">Live Now</span>
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Matchs en direct</p>
           <p className="text-2xl font-black text-white">{stats.live}</p>
        </div>
        <div className="bg-[#0F111A] border border-white/5 rounded-3xl p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                 <Tv2 size={18} />
              </div>
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Matchs programmés</p>
           <p className="text-2xl font-black text-white">{stats.upcoming}</p>
        </div>
        <div className="bg-[#0F111A] border border-white/5 rounded-3xl p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                 <UsersIcon size={18} />
              </div>
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Utilisateurs</p>
           <p className="text-2xl font-black text-white">{stats.users}</p>
        </div>
        <div className="bg-[#0F111A] border border-white/5 rounded-3xl p-6">
           <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                 <Zap size={18} />
              </div>
           </div>
           <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Abonnés Premium</p>
           <p className="text-2xl font-black text-white">{stats.premium}</p>
        </div>
      </div>

      {/* ⚡ MATCHS EN DIRECT */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-indigo-600 rounded-full" />
          <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Matchs en direct</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {liveMatches.map(match => (
            <div key={match.id} className="bg-[#0F111A] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Tv2 className="text-zinc-700" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center border-4 border-[#0F111A]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black text-white tracking-tighter uppercase italic">{match.name}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">LIVE</span>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">•</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{match.viewers} Viewers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Sources Health</p>
                  <div className="flex gap-2">
                    {match.streamSources?.map(source => (
                      <div key={source.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                        {source.status === "valid" ? <CheckCircle2 className="text-emerald-500" size={10} /> : <XCircle className="text-red-500" size={10} />}
                        <span className={`text-[8px] font-black uppercase tracking-widest ${source.status === "valid" ? "text-white" : "text-zinc-600"}`}>
                          {source.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-4 bg-white/5 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Edit3 size={14} /> Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

