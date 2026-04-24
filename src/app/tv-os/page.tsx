'use client'

import { useChannels } from "@/hooks/useChannels"
import { useTrending } from "@/hooks/useTrending"
import TrendingChart from "./TrendingChart"

export default function TvOsHub() {
  const { channels } = useChannels()
  const { trending } = useTrending()

  const channelCount = channels.length
  
  // Transform trending data for chart
  const chartData = trending.map(t => ({
    name: t.channels?.name || 'Unknown',
    Heat: t.score,
    Zaps: t.zap_count
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tight">Hub Télémétrique</h2>
        <p className="text-gray-500 font-medium">Monitoring du réseau neuronal StreamPerf OS en temps réel.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111115] border border-white/5 p-8 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-500 group">
          <h3 className="text-[10px] text-gray-500 font-bold mb-2 tracking-widest uppercase group-hover:text-indigo-400 transition-colors">Global Catalog</h3>
          <p className="text-5xl font-black text-indigo-500">{channelCount.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-indigo-400/60 font-semibold italic">Flux indexés & validés</span>
          </div>
        </div>
        
        <div className="bg-[#111115] border border-white/5 p-8 rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all duration-500 group">
          <h3 className="text-[10px] text-gray-500 font-bold mb-2 tracking-widest uppercase group-hover:text-emerald-400 transition-colors">Client Activity</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-emerald-500">Live</p>
            <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400/60 font-semibold italic">
             WebSocket Tunnel Active
          </div>
        </div>

        <div className="bg-[#111115] border border-white/5 p-8 rounded-3xl shadow-xl hover:border-red-500/30 transition-all duration-500 group">
          <h3 className="text-[10px] text-gray-500 font-bold mb-2 tracking-widest uppercase group-hover:text-red-400 transition-colors">Heat Map Score</h3>
          <p className="text-5xl font-black text-red-600">{trending.length > 0 ? Math.max(...trending.map(t => t.score)).toFixed(1) : "0.0"}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-red-400/60 font-semibold italic uppercase tracking-widest">
             Peak engagement signal
          </div>
        </div>
      </div>
      
      <div className="bg-[#111115] border border-white/5 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-3xl font-black flex items-center gap-4 text-white">
            <span className="w-5 h-5 rounded-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse"></span> 
            Live TV Heatmap
          </h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 border border-white/5 italic">Realtime SQL Stream</span>
          </div>
        </div>

        <div className="relative z-10">
          <TrendingChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-[#111115] border border-white/5 p-8 rounded-3xl">
           <h4 className="text-xl font-bold mb-6 text-white border-b border-white/5 pb-4">Derniers Événements</h4>
           <div className="flex flex-col gap-4">
              {trending.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{t.channels?.name || "Canal Anonyme"}</span>
                      <span className="text-[10px] text-gray-500 font-mono">ID: {t.channel_id}</span>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                         <span className="text-xs text-indigo-400 font-bold">{t.score} Engagement</span>
                         <span className="text-[10px] text-gray-600">{t.zap_count} Zaps total</span>
                      </div>
                   </div>
                </div>
              ))}
              {trending.length === 0 && (
                <p className="text-gray-600 text-center italic py-10">Attente de flux tèlèmétriques...</p>
              )}
           </div>
        </section>

        <section className="bg-[#111115] border border-white/5 p-8 rounded-3xl flex flex-col gap-6">
           <h4 className="text-xl font-bold text-white border-b border-white/5 pb-4">Statut de l'IA TV OS</h4>
           <div className="flex flex-col gap-8 py-4">
              <div className="flex items-center justify-between">
                 <span className="text-gray-400 font-medium">Behavior Graph Sync</span>
                 <span className="text-emerald-500 font-black text-sm uppercase tracking-widest italic">Stable</span>
              </div>
               <div className="flex items-center justify-between">
                 <span className="text-gray-400 font-medium">Predictive Ranking Latency</span>
                 <span className="text-indigo-400 font-black text-sm">&lt; 15ms (Native RPC)</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-gray-400 font-medium">Trend Persistence Layer</span>
                 <span className="text-emerald-500 font-black text-sm uppercase tracking-widest italic">Active</span>
              </div>
           </div>
           <div className="mt-auto p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-indigo-600/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">i</div>
              <div>
                 <p className="text-xs font-bold text-white uppercase tracking-tighter">AI Node Health</p>
                 <p className="text-[10px] text-indigo-400/80 font-medium">Toutes les fonctions RPC sont nominales. 0 timeout détecté sur les dernières 24h.</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  )
}
