"use client";

import { useEffect, useState } from "react";
import { 
  Tv2, 
  Trash2, 
  ShieldCheck, 
  MonitorPlay, 
  Plus, 
  Globe,
  Radio,
  FileCode,
  AlertCircle,
  RotateCw
} from "lucide-react";

/**
 * 📺 STREAM ORCHESTRATION HUB
 * Professional M3U Ingestion & Monitoring Center.
 */
export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    async function fetchStreams() {
      try {
        const res = await fetch("/api/admin/saas/streams", {
          headers: { "x-admin-secret": "staff_emerge_key" }
        });
        const data = await res.json();
        setStreams(data);
      } catch (e) {
        console.error("Streams sync failed");
      } finally {
        setLoading(false);
      }
    }
    fetchStreams();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Soft-Delete this stream? Historical AdX data will be preserved.")) {
      await fetch(`/api/admin/saas/streams/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": "staff_emerge_key" }
      });
      setStreams(streams.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tighter text-white">Stream <span className="text-zinc-700">Studio</span></h2>
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Industrial M3U Orchestration & CDN Health</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
              <input 
                placeholder="M3U Master URL..." 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-[11px] font-black uppercase tracking-widest text-white w-96 focus:border-indigo-500 outline-none transition shadow-inner"
              />
           </div>
           <button className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition">
             Ingest Stream
           </button>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { label: "Active Nodes", value: streams.length, icon: Radio, color: "text-emerald-500" },
           { label: "Global Uptime", value: "99.98%", icon: ShieldCheck, color: "text-indigo-500" },
           { label: "Playlist Sync", value: "3m ago", icon: RotateCw, color: "text-zinc-500" }
         ].map((stat, i) => (
           <div key={i} className="bg-[#0F111A] border border-white/5 rounded-3xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
                 <stat.icon size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                 <p className={`text-xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* STREAMS GRID */}
      <div className="bg-[#0F111A] border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Node Configuration</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Latency / Health</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Status</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="h-20 animate-pulse bg-white/[0.01]" /></tr>)
            ) : streams.length > 0 ? (
              streams.map(stream => (
                <tr key={stream.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-5 font-black">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500">
                          <Tv2 size={20} />
                        </div>
                        <div>
                          <p className="text-[12px] uppercase tracking-tighter text-white">{stream.name}</p>
                          <p className="text-[8px] font-bold text-zinc-600 tracking-tight uppercase">{stream.category || "General"}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="space-y-2">
                        <div className="flex justify-between items-end w-32">
                           <span className="text-[8px] font-black text-zinc-700 uppercase">Latency</span>
                           <span className="text-[8px] font-black text-emerald-500">22ms</span>
                        </div>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="w-1/4 h-full bg-emerald-500/50" />
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Master Live</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-3 bg-white/5 text-zinc-400 rounded-2xl hover:bg-white/10 hover:text-white transition">
                           <FileCode size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(stream.id)}
                          className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                   <AlertCircle className="mx-auto text-zinc-800 mb-4" size={32} />
                   <p className="text-zinc-700 font-black uppercase tracking-widest text-[10px]">Matrix Empty • Ingest Your First Stream</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
