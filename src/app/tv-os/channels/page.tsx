'use client'

import { useChannels } from "@/hooks/useChannels"
import { useState } from "react"

export default function ChannelsPage() {
  const { channels } = useChannels()
  const [search, setSearch] = useState("")

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
           <h2 className="text-4xl font-black text-white tracking-tight">Catalog Intelligence</h2>
           <p className="text-gray-500 font-medium">Gestion des {channels.length} signaux vidéo actifs sur le réseau.</p>
        </div>
        <div className="relative w-full md:w-80">
           <input 
              type="text" 
              placeholder="Rechercher un flux... (Nom, Catégorie)" 
              className="w-full bg-[#111115] border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">⌘F</div>
        </div>
      </header>

      <div className="bg-[#111115] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#16161c] text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-8 py-6">Signal ID</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredChannels.slice(0, 100).map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5 text-gray-600 font-mono text-[11px] font-bold tracking-tighter">
                    {c.id.slice(0, 12)}...
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-indigo-500/30 transition-colors">
                        {c.logo_url ? (
                          <img src={c.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[10px] text-gray-700 font-black">{c.name.slice(0, 2)}</div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{c.name}</span>
                        <span className="text-[10px] text-gray-600 font-medium truncate max-w-[200px]">{c.stream_url}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
                      {c.category || "General"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${c.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-600"}`}></span>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${c.is_active ? "text-emerald-500" : "text-red-600"}`}>
                          {c.is_active ? "Live" : "Down"}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-all">
                      Diagnostics
                    </button>
                  </td>
                </tr>
              ))}
              {filteredChannels.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-gray-600 font-bold text-lg">Aucun signal ne correspond à la recherche.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredChannels.length > 100 && (
           <div className="bg-[#16161c] p-6 text-center border-t border-white/5">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Affichage des 100 premiers résultats sur {filteredChannels.length} au total.
              </p>
           </div>
        )}
      </div>
    </div>
  )
}
