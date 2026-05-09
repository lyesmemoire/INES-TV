"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Globe, Youtube, Facebook, Activity, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import SafeClient from "@/components/SafeClient"

/**
 * 🎛️ ADMIN: Gestion des Flux par Match
 */
export default function MatchStreamsAdminPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<any>(null)

  // Form State
  const [newStream, setNewStream] = useState({
    type: "m3u8",
    url: "",
    priority: 1
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [streamsRes, matchRes] = await Promise.all([
          fetch(`/api/admin/streams?channelId=${id}`),
          fetch(`/api/admin/matches/${id}`) // Supposé exister
        ])
        
        const streamsData = await streamsRes.json()
        const matchData = await matchRes.json()

        setStreams(streamsData.streams || [])
        setMatch(matchData.match)
      } catch (err) {
        console.error("Failed to load match streams")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleAddStream = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStream, channelId: id })
      })
      if (res.ok) {
        const data = await res.json()
        setStreams(prev => [...prev, data.stream].sort((a, b) => a.priority - b.priority))
        setNewStream({ type: "m3u8", url: "", priority: 1 })
      }
    } catch (err) {
      alert("Erreur lors de l'ajout")
    }
  }

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm("Supprimer ce flux ?")) return
    try {
      const res = await fetch(`/api/admin/streams?id=${streamId}`, { method: "DELETE" })
      if (res.ok) {
        setStreams(prev => prev.filter(s => s.id !== streamId))
      }
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const toggleStreamStatus = async (stream: any) => {
    try {
      const res = await fetch("/api/admin/streams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: stream.id, isActive: !stream.isActive })
      })
      if (res.ok) {
        setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, isActive: !s.isActive } : s))
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour")
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Chargement de la régie des flux...</div>

  return (
    <SafeClient>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                  Gestion des Flux
                </h1>
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest mt-1">
                  {match?.homeName || "Match"} vs {match?.awayName || "Match"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="text-emerald-500" size={20} />
                  Ajouter une Source
                </h2>

                <form onSubmit={handleAddStream} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Type de Flux</label>
                    <select 
                      value={newStream.type}
                      onChange={(e) => setNewStream({...newStream, type: e.target.value})}
                      className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition"
                    >
                      <option value="m3u8">Direct M3U8 / HLS</option>
                      <option value="youtube">YouTube Live</option>
                      <option value="facebook">Facebook Live</option>
                      <option value="dash">DASH</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">URL du Flux / ID Video</label>
                    <input 
                      type="text"
                      required
                      placeholder="https://..."
                      value={newStream.url}
                      onChange={(e) => setNewStream({...newStream, url: e.target.value})}
                      className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Priorité (1 = Haut)</label>
                    <input 
                      type="number"
                      min="1"
                      value={newStream.priority}
                      onChange={(e) => setNewStream({...newStream, priority: parseInt(e.target.value)})}
                      className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition"
                    />
                  </div>

                  <button className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95">
                    Enregistrer la Source
                  </button>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="text-blue-500" size={20} />
                  Sources Configurées ({streams.length})
                </h2>

                {streams.length === 0 ? (
                  <div className="bg-zinc-900 border border-dashed border-zinc-800 p-12 text-center rounded-2xl">
                    <p className="text-zinc-500">Aucune source de secours configurée pour ce match.</p>
                  </div>
                ) : (
                  streams.map((stream, idx) => (
                    <div key={stream.id} className={`bg-zinc-900 border ${stream.isActive ? 'border-white/5' : 'border-red-500/20 opacity-50'} p-6 rounded-2xl transition-all hover:border-white/10 group`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/5">
                            {stream.type === 'youtube' ? <Youtube size={20} className="text-red-500" /> : 
                             stream.type === 'facebook' ? <Facebook size={20} className="text-blue-500" /> : 
                             <Globe size={20} className="text-zinc-500" />}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black italic tracking-tighter uppercase">Priorité {stream.priority}</span>
                              {stream.status === 'ONLINE' ? (
                                <CheckCircle size={14} className="text-emerald-500" />
                              ) : stream.status === 'OFFLINE' ? (
                                <XCircle size={14} className="text-red-500" />
                              ) : (
                                <div className="w-2 h-2 bg-zinc-600 rounded-full" title="Inconnu" />
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 truncate max-w-md font-mono mt-0.5">{stream.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleStreamStatus(stream)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              stream.isActive ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                            }`}
                          >
                            {stream.isActive ? 'Active' : 'Désactivée'}
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteStream(stream.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SafeClient>
  )
}
