"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Share2, Info, ChevronRight, Activity, Users } from "lucide-react"
import Link from "next/link"
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer"
import { Channel } from "@/src/types"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Channel[]>([])

  useEffect(() => {
    // In a real app, we would fetch channel details by ID
    // For now, we fetch all and find the one matching the ID
    fetch("/api/channels")
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: Channel) => c.id === id)
        setChannel(found || null)
        setRecommendations(data.filter((c: Channel) => c.id !== id).slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-full" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>
    </div>
  )

  if (!channel) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Chaîne Introuvable</h1>
        <p className="text-zinc-500 mb-8">Désolé, ce flux n'est plus disponible ou l'adresse est incorrecte.</p>
        <Link href="/" className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 transition-all">
            RETOURNER À L'ACCUEIL
        </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6 flex items-center justify-between">
        <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl transition-all"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Retour</span>
        </button>

        <div className="flex items-center gap-3">
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <Share2 size={20} />
            </button>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <Info size={20} />
            </button>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-12 pb-24 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PLAYER COLUMN */}
        <div className="lg:col-span-3 space-y-8">
          <VideoPlayer 
            streamUrl={channel.streamUrl} 
            title={channel.name}
            poster={channel.thumbnail}
          />

          {/* CHANNEL INFO */}
          <div className="bg-zinc-900/50 rounded-[2.5rem] border border-white/5 p-8 backdrop-blur-3xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                    <img src={channel.logo || "/placeholder-logo.png"} alt={channel.name} className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{channel.name}</h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">{channel.category}</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Diffusion 4K Ultra HD</span>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-emerald-400 font-black">
                        <Users size={16} />
                        <span className="tabular-nums">1.2M</span>
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Spectateurs</span>
                </div>
                <div className="w-px h-10 bg-white/5 mx-2" />
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-blue-400 font-black">
                        <Activity size={16} />
                        <span className="tabular-nums">6.2 MBPS</span>
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Bitrate Actuel</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-zinc-400 leading-relaxed text-sm">
                    {channel.description || "Suivez en direct et en haute définition l'intégralité de la compétition sur StreamPerf. Profitez d'une latence ultra-faible et d'une qualité d'image exceptionnelle pour ne rien rater de l'action."}
                </p>
            </div>
          </div>
        </div>

        {/* SIDEBAR: NEXT UP / RECOMMENDATIONS */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">À Suivre</h3>
                <Link href="/" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Voir Tout</Link>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec) => (
                    <Link 
                        key={rec.id} 
                        href={`/watch/${rec.id}`}
                        className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all group"
                    >
                        <div className="relative w-24 aspect-video rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={rec.thumbnail || rec.logo || ""} alt={rec.name} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
                            {rec.status === 'LIVE' && (
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600 text-[8px] font-black rounded-md">LIVE</div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <h4 className="text-xs font-black text-white truncate">{rec.name}</h4>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{rec.category}</span>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">HD Disponible</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* AD BANNER / SPONSOR */}
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Activity size={80} />
                </div>
                <h4 className="text-lg font-black text-white relative z-10">StreamPerf Premium</h4>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">Zéro Latence · Zéro Pubs</p>
                <button className="mt-4 px-4 py-2 bg-white text-blue-700 text-[10px] font-black rounded-xl relative z-10 hover:scale-105 transition-all">
                    PASSER AU PRO
                </button>
            </div>
        </div>
      </main>
    </div>
  )
}
