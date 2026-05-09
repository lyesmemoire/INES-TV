"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Settings, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Smartphone, 
  Monitor,
  X,
  BarChart3,
  TrendingUp,
  Zap,
  Activity
} from "lucide-react"
import SafeClient from "@/components/SafeClient"
import { calculateScore } from "@/lib/ads/optimizer"
import { logAuditAction, validateAdScript } from "@/lib/ads/service"

interface AdProvider {
  id: string
  name: string
  script_url: string
  format: string
  active: boolean
  max_per_24h: number
  allowed_countries: string[] | null
  device: string
  created_at: string
  rpm: number
  ctr: number
  stability_score: number
  priority_boost: number
  quality_score: number
}

export default function CampaignsPage() {
  const [providers, setProviders] = useState<AdProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AdProvider | null>(null)
  const [recalculating, setRecalculating] = useState(false)

  async function triggerRecalculate() {
    setRecalculating(true)
    try {
      const res = await fetch('/api/ads/recalculate-metrics')
      if (res.ok) fetchProviders()
    } catch (err) {
      console.error('Recalculation failed')
    }
    setRecalculating(false)
  }
  
  const [formData, setFormData] = useState({
    name: "",
    script_url: "",
    format: "pop",
    active: true,
    max_per_24h: 1,
    allowed_countries: "",
    device: "both",
    rpm: 0,
    ctr: 0,
    stability_score: 100,
    priority_boost: 0,
    quality_score: 100
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  async function fetchProviders() {
    setLoading(true)
    const { data, error } = await supabase
      .from("ad_providers")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) setProviders(data || [])
    setLoading(false)
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("ad_providers")
      .update({ active: !currentStatus })
      .eq("id", id)

    if (!error) {
      logAuditAction('TOGGLE', id, { active: !currentStatus })
      setProviders(prev => prev.map(p => p.id === id ? { ...p, active: !currentStatus } : p))
    }
  }

  async function deleteProvider(id: string) {
    if (!confirm("Supprimer cette régie ?")) return
    const { error } = await supabase.from("ad_providers").delete().eq("id", id)
    if (!error) {
      logAuditAction('DELETE', id)
      setProviders(prev => prev.filter(p => p.id !== id))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 🛡️ Security Validation
    if (!validateAdScript(formData.script_url)) {
      alert("URL du script invalide. Doit commencer par https://")
      return
    }

    const payload = {
      ...formData,
      allowed_countries: formData.allowed_countries 
        ? formData.allowed_countries.split(",").map(c => c.trim().toUpperCase()) 
        : null,
      rpm: parseFloat(formData.rpm as any),
      ctr: parseFloat(formData.ctr as any),
      stability_score: parseFloat(formData.stability_score as any),
      priority_boost: parseInt(formData.priority_boost as any),
      quality_score: parseInt(formData.quality_score as any)
    }

    let error, data
    if (editingProvider) {
      const { error: err } = await supabase
        .from("ad_providers")
        .update(payload)
        .eq("id", editingProvider.id)
      error = err
      if (!error) logAuditAction('UPDATE', editingProvider.id, payload)
    } else {
      const { data: inserted, error: err } = await supabase.from("ad_providers").insert([payload]).select()
      error = err
      data = inserted
      if (data && !error) logAuditAction('CREATE', data[0].id, payload)
    }

    if (!error) {
      setIsModalOpen(false)
      setEditingProvider(null)
      fetchProviders()
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      script_url: "",
      format: "pop",
      active: true,
      max_per_24h: 1,
      allowed_countries: "",
      device: "both",
      rpm: 0,
      ctr: 0,
      stability_score: 100,
      priority_boost: 0,
      quality_score: 100
    })
  }

  const openEdit = (provider: AdProvider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name,
      script_url: provider.script_url,
      format: provider.format,
      active: provider.active,
      max_per_24h: provider.max_per_24h,
      allowed_countries: provider.allowed_countries?.join(", ") || "",
      device: provider.device,
      rpm: provider.rpm || 0,
      ctr: provider.ctr || 0,
      stability_score: provider.stability_score || 100,
      priority_boost: provider.priority_boost || 0,
      quality_score: provider.quality_score || 100
    })
    setIsModalOpen(true)
  }

  return (
    <SafeClient>
      <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-[0.2em] text-xs">
                <BarChart3 size={16} />
                <span>Monétisation & Optimizer</span>
              </div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                Ad <span className="text-red-600 underline decoration-4 underline-offset-8">Exchange</span> Engine
              </h1>
              <p className="text-zinc-500 max-w-xl font-medium">
                Optimisation automatique des revenus basée sur le RPM, le CTR et la stabilité.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={triggerRecalculate}
                disabled={recalculating}
                className="flex items-center gap-3 bg-zinc-800 text-white px-6 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                <Activity size={16} className={recalculating ? 'animate-spin' : ''} />
                {recalculating ? 'Recalcul...' : 'Recalculer RPM'}
              </button>
              
              <button 
                onClick={() => {
                  setEditingProvider(null)
                  resetForm()
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-2xl shadow-white/5"
              >
                <Plus size={18} />
                Nouvelle Régie
              </button>
            </div>
          </div>

          {/* PROVIDERS GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">
                Chargement de l'intelligence publicitaire...
              </div>
            ) : providers.length === 0 ? (
              <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-3xl text-center text-zinc-500">
                Aucune régie configurée.
              </div>
            ) : (
              providers.map((provider) => {
                const score = calculateScore({
                  rpm: provider.rpm,
                  ctr: provider.ctr,
                  stability: provider.stability_score,
                  priorityBoost: provider.priority_boost,
                  qualityScore: provider.quality_score
                })

                return (
                  <motion.div 
                    layout
                    key={provider.id}
                    className={`group relative overflow-hidden bg-zinc-900/40 border ${provider.active ? 'border-white/10' : 'border-red-900/20'} p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${provider.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {provider.active ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black uppercase italic tracking-tighter">{provider.name}</h3>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <span>Format: {provider.format}</span>
                                <span>•</span>
                                <span>Cap: {provider.max_per_24h}/24h</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Optimizer Score</div>
                            <div className="text-2xl font-black text-red-600">{score.toFixed(1)}</div>
                          </div>
                        </div>

                        {/* METRICS ROW */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                          <div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                              <TrendingUp size={10} /> RPM
                            </div>
                            <div className="text-lg font-black">${provider.rpm.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                              <Activity size={10} /> CTR
                            </div>
                            <div className="text-lg font-black">{(provider.ctr * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                              <Zap size={10} /> Santé
                            </div>
                            <div className="text-lg font-black">{provider.quality_score}%</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                            {provider.device === "mobile" ? <Smartphone size={12} /> : provider.device === "desktop" ? <Monitor size={12} /> : <Globe size={12} />}
                            {provider.device}
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                            <Globe size={12} />
                            {provider.allowed_countries ? provider.allowed_countries.join(", ") : "Global"}
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-3 justify-end">
                        <button 
                          onClick={() => toggleActive(provider.id, provider.active)}
                          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                            provider.active 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {provider.active ? "Actif" : "Activer"}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(provider)} className="p-3 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all"><Settings size={18} /></button>
                          <button onClick={() => deleteProvider(provider.id)} className="p-3 bg-zinc-800 hover:bg-red-600 text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* MODAL FORM */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-600/10 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    {editingProvider ? "Modifier la Régie" : "Ajouter une Régie"}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* BASE CONFIG */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Configuration de Base</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nom de la Régie</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 focus:border-red-600 outline-none transition-all font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Format</label>
                        <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 focus:border-red-600 outline-none transition-all font-medium">
                          <option value="pop">Pop-under</option>
                          <option value="social">Social Bar</option>
                          <option value="banner">Banner</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">URL du Script</label>
                      <input required type="url" value={formData.script_url} onChange={e => setFormData({...formData, script_url: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 focus:border-red-600 outline-none transition-all font-mono text-xs" />
                    </div>
                  </div>

                  {/* OPTIMIZER METRICS */}
                  <div className="space-y-6 bg-zinc-900/30 p-6 rounded-3xl border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Moteur d'Optimisation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">RPM ($)</label>
                        <input type="number" step="0.01" value={formData.rpm} onChange={e => setFormData({...formData, rpm: parseFloat(e.target.value)})} className="w-full bg-black border border-white/5 rounded-xl p-3 focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">CTR (%)</label>
                        <input type="number" step="0.01" value={formData.ctr} onChange={e => setFormData({...formData, ctr: parseFloat(e.target.value)})} className="w-full bg-black border border-white/5 rounded-xl p-3 focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Boost (+/-)</label>
                        <input type="number" value={formData.priority_boost} onChange={e => setFormData({...formData, priority_boost: parseInt(e.target.value)})} className="w-full bg-black border border-white/5 rounded-xl p-3 focus:border-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stabilité (0-100)</label>
                        <input type="range" min="0" max="100" value={formData.stability_score} onChange={e => setFormData({...formData, stability_score: parseInt(e.target.value)})} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600" />
                        <div className="text-right text-[10px] font-bold text-zinc-600">{formData.stability_score}%</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Qualité/Sécurité (0-100)</label>
                        <input type="range" min="0" max="100" value={formData.quality_score} onChange={e => setFormData({...formData, quality_score: parseInt(e.target.value)})} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        <div className="text-right text-[10px] font-bold text-zinc-600">{formData.quality_score}%</div>
                      </div>
                    </div>
                  </div>

                  {/* TARGETING */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Ciblage & Capping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Appareils</label>
                        <select value={formData.device} onChange={e => setFormData({...formData, device: e.target.value})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4">
                          <option value="both">Tous</option>
                          <option value="mobile">Mobile</option>
                          <option value="desktop">Desktop</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Capping 24h</label>
                        <input type="number" min="1" value={formData.max_per_24h} onChange={e => setFormData({...formData, max_per_24h: parseInt(e.target.value)})} className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pays (ISO-2)</label>
                      <input type="text" value={formData.allowed_countries} onChange={e => setFormData({...formData, allowed_countries: e.target.value})} placeholder="FR, US, MA..." className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4" />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="submit" className="flex-1 bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all active:scale-95">
                      {editingProvider ? "Mettre à jour" : "Lancer la Régie"}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-zinc-800 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all">Annuler</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </SafeClient>
  )
}
