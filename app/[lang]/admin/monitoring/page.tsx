"use client"

import { useEffect, useState } from "react"
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"
import SafeClient from "@/components/SafeClient"

/**
 * 📡 ADMIN: Système de Monitoring Global
 */
export default function MonitoringPage() {
  const [offlineStreams, setOfflineStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const loadOffline = async () => {
    try {
      const res = await fetch("/api/admin/streams/offline") // À créer ou filtrer
      const data = await res.json()
      setOfflineStreams(data.streams || [])
    } catch (err) {
      console.error("Monitoring load error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOffline()
    const interval = setInterval(loadOffline, 15000)
    return () => clearInterval(interval)
  }, [])

  const forceRecheck = async () => {
    setChecking(true)
    try {
      await fetch("/api/streams/health-check")
      await loadOffline()
    } finally {
      setChecking(false)
    }
  }

  if (loading) return <div className="p-8 text-center animate-pulse">Scan du réseau en cours...</div>

  return (
    <SafeClient>
      <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Monitoring Santé</h1>
            </div>
            
            <button 
              onClick={forceRecheck}
              disabled={checking}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              <RefreshCw size={20} className={checking ? "animate-spin" : ""} />
              {checking ? "Scan en cours..." : "Forcer le Recheck"}
            </button>
          </div>

          {/* Offline List */}
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2 text-red-500">
                <AlertTriangle size={20} />
                Flux Hors-Ligne ({offlineStreams.length})
              </h2>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Auto-refresh: 15s</span>
            </div>

            {offlineStreams.length === 0 ? (
              <div className="p-20 text-center">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <p className="text-xl font-bold">Tous les systèmes sont au vert</p>
                <p className="text-zinc-500 text-sm mt-1">Aucune interruption de service détectée.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {offlineStreams.map((stream) => (
                  <div key={stream.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tighter">{stream.channel?.name || "Match Inconnu"}</p>
                        <p className="text-xs text-zinc-500 font-mono truncate max-w-lg mt-0.5">{stream.url}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Dernier Échec</p>
                      <p className="text-xs font-bold text-red-400 mt-0.5">{new Date(stream.lastCheckedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SafeClient>
  )
}
