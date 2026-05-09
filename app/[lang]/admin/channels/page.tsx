"use client"

import React, { useEffect, useState, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"
import SafeClient from "@/components/SafeClient"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type StreamSource = {
  id: string
  url: string
  isActive: boolean
  healthScore: number
  priority: number
  lastCheckedAt: string | null
}

type ChannelWithSources = {
  id: string
  name: string
  logo: string | null
  category: string
  isActive: boolean
  LiveSource: StreamSource[]
  type: "STANDARD" | "FTA"
}

export default function ChannelsAdminPage() {
  const [channels, setChannels] = useState<ChannelWithSources[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    try {
      const [standardRes, ftaRes] = await Promise.all([
        supabase
          .from("Channel")
          .select(`
            id,
            name,
            logo,
            category,
            isActive,
            LiveSource (
              id,
              url,
              isActive,
              healthScore,
              priority,
              lastCheckedAt
            )
          `)
          .order("name", { ascending: true }),
        fetch("/api/admin/fta").then(res => res.json())
      ])

      const standardData = (standardRes.data || []).map(c => ({ ...c, type: "STANDARD" }))
      const ftaData = (ftaRes || []).map((c: any) => ({
        ...c,
        type: "FTA",
        LiveSource: (c.streams || []).map((s: any) => ({
          id: s.id,
          url: s.url,
          isActive: s.isActive,
          healthScore: 1,
          priority: s.priority,
          lastCheckedAt: null
        }))
      }))

      setChannels([...standardData, ...ftaData] as any)
    } catch (e) {
      console.error("Failed to fetch channels:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const [confirming, setConfirming] = useState<string | null>(null)

  // 🔥 DELETE FULL CHANNEL
  async function handleDeleteChannelClick(id: string) {
    if (confirming === id) {
      setConfirming(null)
      deleteChannel(id)
    } else {
      setConfirming(id)
      setTimeout(() => setConfirming(null), 3000)
    }
  }

  async function deleteChannel(id: string) {
    const channel = channels.find(c => c.id === id)
    if (!channel) return

    setDeleting(id)
    try {
      let res
      if (channel.type === "FTA") {
        res = await fetch(`/api/admin/fta/${id}`, { method: "DELETE" })
      } else {
        res = await fetch(`/api/channels?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      }

      if (!res.ok) throw new Error("Failed")
      setChannels(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error("Delete error:", e)
      alert("Erreur lors de la suppression")
    }
    setDeleting(null)
  }

  // 🔥 DELETE SINGLE SOURCE
  async function handleDeleteSourceClick(sourceId: string, channelId: string) {
    if (confirming === sourceId) {
      setConfirming(null)
      deleteSource(sourceId, channelId)
    } else {
      setConfirming(sourceId)
      setTimeout(() => setConfirming(null), 3000)
    }
  }

  async function deleteSource(sourceId: string, channelId: string) {
    setDeleting(sourceId)
    try {
      const res = await fetch(`/api/stream/${encodeURIComponent(sourceId)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")

      setChannels(prev =>
        prev.map(c => {
          if (c.id !== channelId) return c

          const updatedSources = c.LiveSource.filter(s => s.id !== sourceId)

          // Auto-delete channel if no sources left
          if (updatedSources.length === 0) {
            fetch(`/api/channels?id=${encodeURIComponent(channelId)}`, { method: "DELETE" })
            return null as any
          }

          return { ...c, LiveSource: updatedSources }
        }).filter(Boolean)
      )
    } catch (e) {
      alert("Erreur lors de la suppression")
    }
    setDeleting(null)
  }

  // Filter channels by search
  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const totalSources = channels.reduce((acc, c) => acc + (c.LiveSource?.length || 0), 0)
  const aliveSources = channels.reduce(
    (acc, c) => acc + (c.LiveSource?.filter(s => s.isActive === true).length || 0),
    0
  )
  const deadSources = channels.reduce(
    (acc, c) => acc + (c.LiveSource?.filter(s => s.isActive === false).length || 0),
    0
  )

  if (loading) {
    return (
      <SafeClient>
        <div className="p-10 text-white flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Chargement des chaînes...
        </div>
      </SafeClient>
    )
  }

  return (
    <SafeClient>
      <div className="p-6 md:p-8 text-white space-y-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">📺 Channel Management</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {channels.length} chaînes • {totalSources} sources
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/channels/new"
              className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors text-center text-sm flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Ajouter manuellement
            </Link>
            <Link
              href="/admin/channels/import"
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors text-center text-sm"
            >
              + Importer M3U
            </Link>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Chaînes</p>
            <p className="text-2xl font-black text-white mt-1">{channels.length}</p>
          </div>
          <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Sources</p>
            <p className="text-2xl font-black text-white mt-1">{totalSources}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Alive</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{aliveSources}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Dead</p>
            <p className="text-2xl font-black text-red-400 mt-1">{deadSources}</p>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Rechercher une chaîne..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3.5 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 outline-none focus:border-red-500/50 transition-colors"
        />

        {/* CHANNEL LIST */}
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <p className="text-zinc-500 mb-4">
              {search ? "Aucun résultat pour cette recherche." : "Aucune chaîne importée."}
            </p>
            <Link href="/admin/channels/import" className="text-red-500 hover:text-red-400 font-medium">
              Importer une playlist M3U &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(channel => (
              <div
                key={channel.id}
                className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
              >
                {/* CHANNEL HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center p-1.5 flex-shrink-0">
                      {channel.logo ? (
                        <Image
                          src={channel.logo}
                          alt={channel.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-lg">📺</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-white truncate">{channel.name}</h2>
                        {channel.type === "FTA" && (
                          <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            FTA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {channel.category || "Uncategorized"}
                        </span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {channel.LiveSource?.length || 0} source{(channel.LiveSource?.length || 0) > 1 ? "s" : ""}
                        </span>
                        {!channel.isActive && (
                          <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-md uppercase">
                            disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteChannelClick(channel.id)}
                    disabled={deleting === channel.id}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex-shrink-0"
                  >
                    {deleting === channel.id 
                      ? "..." 
                      : confirming === channel.id 
                        ? "ÊTES-VOUS SÛR ?" 
                        : "SUPPRIMER"}
                  </button>
                </div>

                {/* SOURCES LIST */}
                <div className="divide-y divide-white/[0.03]">
                  {channel.LiveSource?.map(source => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Status indicator */}
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            source.isActive === true
                              ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                              : "bg-red-500 shadow-sm shadow-red-500/50"
                          }`}
                        />

                        {/* URL */}
                        <span className="text-xs text-zinc-400 truncate font-mono max-w-[50%]">
                          {source.url}
                        </span>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              source.healthScore >= 0.8
                                ? "bg-emerald-500/20 text-emerald-400"
                                : source.healthScore >= 0.5
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            Q:{(source.healthScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSourceClick(source.id, channel.id)}
                        disabled={deleting === source.id}
                        className="text-red-400/60 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-30 flex-shrink-0 ml-3"
                      >
                        {deleting === source.id 
                          ? "..." 
                          : confirming === source.id 
                            ? "SÛR ?" 
                            : "retirer"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SafeClient>
  )
}
