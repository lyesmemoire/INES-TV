"use client";

import { useEffect, useState } from "react";
import { 
  Tv2, 
  Trash2, 
  ShieldCheck, 
  MonitorPlay, 
  Plus, 
  RotateCw,
  Search,
  Edit3,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import MatchForm from "@/src/components/Admin/MatchForm";
import { Channel } from "@/src/types";

export default function AdminStreamsPage() {
  const [matches, setMatches] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Partial<Channel> | null>(null);

  useEffect(() => {
    // Mocking matches for management
    setMatches([
      {
        id: "1",
        name: "PSG vs OM",
        category: "football",
        status: "LIVE",
        viewers: "45.2k",
        logo: "",
        score: "2-1",
        scheduledAt: "2026-04-24T21:00",
        isPremium: false,
        streamSources: [
          { id: "1", type: "facebook", url: "https://fb.watch/...", priority: 1, isActive: true, status: "valid" },
          { id: "2", type: "m3u8", url: "https://cdn.com/...", priority: 2, isActive: true, status: "valid" }
        ]
      },
      {
        id: "2",
        name: "Real Madrid vs FC Barcelona",
        category: "football",
        status: "UPCOMING",
        viewers: "0",
        logo: "",
        score: "0-0",
        scheduledAt: "2026-04-25T20:45",
        isPremium: true,
        streamSources: [
          { id: "1", type: "m3u8", url: "https://cdn.com/el-clasico.m3u8", priority: 1, isActive: true, status: "unknown" }
        ]
      }
    ]);
    setLoading(false);
  }, []);

  const handleEdit = (match: Channel) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingMatch(null);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce match ?")) {
      setMatches(matches.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-10">
      {/* OVERLAY FORM */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <MatchForm 
            initialData={editingMatch || {}}
            onCancel={() => setShowForm(false)} 
            onSave={(data) => {
              console.log("Saving match...", data);
              setShowForm(false);
            }} 
          />
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tighter text-white">Match <span className="text-zinc-700">Management</span></h2>
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Multi-Source Ingestion & Real-time Metadata</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
              <input 
                placeholder="Rechercher un match..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-[11px] font-black uppercase tracking-widest text-white w-80 focus:border-indigo-500 outline-none transition shadow-inner"
              />
           </div>
           <button 
             onClick={handleAdd}
             className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition flex items-center gap-2"
           >
             <Plus size={16} /> Ajouter un match
           </button>
        </div>
      </div>

      {/* MATCHES LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="h-40 animate-pulse bg-white/5 rounded-[44px]" />
        ) : matches.map(match => (
          <div key={match.id} className="bg-[#0F111A] border border-white/5 rounded-[40px] p-8 flex items-center justify-between group hover:border-white/10 transition-all">
            <div className="flex items-center gap-10">
              <div className="relative">
                <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center">
                  <Tv2 className="text-zinc-700" size={40} />
                </div>
                {match.status === "LIVE" && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-xl flex items-center justify-center border-4 border-[#0F111A]">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">{match.name}</h4>
                  {match.isPremium && (
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[8px] font-black text-amber-500 uppercase tracking-widest">Premium</span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${match.status === "LIVE" ? "text-emerald-500" : "text-zinc-600"}`}>
                      {match.status}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">/</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <RotateCw size={10} className="text-indigo-500" /> {match.category}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">/</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Sources: {match.streamSources?.length || 0} actives
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleEdit(match)}
                className="flex items-center gap-2 px-6 py-4 bg-white/5 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition"
              >
                <Edit3 size={14} /> Gérer les sources
              </button>
              <button 
                onClick={() => handleDelete(match.id)}
                className="p-4 bg-red-600/5 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition"
              >
                <Trash2 size={16} />
              </button>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-700 opacity-20 group-hover:opacity-100 group-hover:text-indigo-500 transition-all">
                 <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK FOOTER STATS */}
      <div className="pt-10 border-t border-white/5 flex gap-12">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Matrix Engine Stable</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Multi-CDN Fallback Active</span>
         </div>
      </div>
    </div>
  );
}

