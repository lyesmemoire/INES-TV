'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Clock } from 'lucide-react'

/**
 * 📺 ContinueWatchingSection
 * Affiche le dernier match consulté par l'utilisateur s'il date de moins de 6h.
 */
export default function ContinueWatchingSection({ dict }: { dict: any }) {
  const [match, setMatch] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('goala_last_match')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Expire après 6 heures pour garder la section pertinente
        if (Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) {
          setMatch(parsed)
        }
      } catch (e) {
        console.error("Failed to parse last match")
      }
    }
  }, [])

  if (!match) return null

  return (
    <section className="px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-red-500" size={20} />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
          Continue Watching
        </h2>
      </div>

      <Link
        href={`/match/${match.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-red-500/50 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative p-8 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest block">Reprendre la lecture</span>
            <h3 className="text-2xl font-bold italic group-hover:text-red-500 transition-colors">
              {match.homeTeam} <span className="text-zinc-500 text-lg mx-2">vs</span> {match.awayTeam}
            </h3>
          </div>
          
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all duration-300">
            <Play className="text-white fill-white ml-1" size={20} />
          </div>
        </div>
      </Link>
    </section>
  )
}
