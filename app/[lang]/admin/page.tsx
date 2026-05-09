"use client"

import { useEffect, useState } from "react"
import { Activity, Radio, AlertTriangle, ShieldCheck, Zap } from "lucide-react"
import SafeClient from "@/components/SafeClient"
import FeaturedMatchManager from "@/components/admin/FeaturedMatchManager"

/**
 * 👑 GOALA Control Center
 * Dashboard principal de monitoring et gestion.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to load dashboard stats")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
    // Refresh toutes les 30s
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-8 text-center animate-pulse">Initialisation du Centre de Contrôle...</div>

  return (
    <SafeClient>
      <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                <Zap className="text-red-600 fill-red-600" />
                GOALA Control Center
              </h1>
              <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.3em] mt-2">
                Monitoring Temps Réel — Production Environment
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Système Opérationnel</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Streams Online" 
              value={stats?.online || 0} 
              icon={<Activity className="text-emerald-500" />}
              color="emerald"
            />
            <StatCard 
              title="Streams Offline" 
              value={stats?.offline || 0} 
              icon={<AlertTriangle className="text-red-500" />}
              color="red"
            />
            <StatCard 
              title="Live Matches" 
              value={stats?.live || 0} 
              icon={<Radio className="text-orange-500 animate-pulse" />}
              color="orange"
            />
            <StatCard 
              title="Health Index" 
              value={`${stats?.health || 100}%`} 
              icon={<Zap className="text-blue-500" />}
              color="blue"
            />
          </div>

          {/* Featured Matches Manager */}
          <div className="mb-12">
            <FeaturedMatchManager />
          </div>

          {/* Recent Alerts / Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">Flux en Alerte</h2>
              {stats?.offline > 0 ? (
                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{stats.offline} flux sont actuellement hors-ligne.</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Vérification recommandée immédiate</p>
                    </div>
                  </div>
                  <button className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition">
                    Analyser
                  </button>
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-12 border border-dashed border-zinc-800 rounded-2xl italic">
                  Aucune anomalie détectée sur le réseau.
                </p>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">Accès Rapides</h2>
                <div className="space-y-3">
                  <QuickLink href="/admin/matches" label="Gérer les Matchs" />
                  <QuickLink href="/admin/monitoring" label="Monitoring Santé" />
                  <QuickLink href="/admin/ads" label="Régies Publicitaires" />
                  <QuickLink href="/admin/settings" label="Paramètres Système" />
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">
                GOALA TV v2.4.0 — Premium Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </SafeClient>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    emerald: "border-emerald-500/20 text-emerald-500",
    red: "border-red-500/20 text-red-500",
    orange: "border-orange-500/20 text-orange-500",
    blue: "border-blue-500/20 text-blue-500",
  }

  return (
    <div className={`bg-zinc-900/80 border ${colorMap[color]} p-8 rounded-3xl transition-all hover:scale-[1.02] hover:shadow-2xl`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</span>
        {icon}
      </div>
      <h2 className={`text-4xl font-black italic tracking-tighter`}>
        {value}
      </h2>
    </div>
  )
}

function QuickLink({ href, label }: any) {
  return (
    <a 
      href={href} 
      className="flex items-center justify-between bg-black/40 hover:bg-white/5 p-4 rounded-xl border border-white/5 transition-all group"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">{label}</span>
      <span className="text-zinc-600 group-hover:translate-x-1 transition-transform">→</span>
    </a>
  )
}
