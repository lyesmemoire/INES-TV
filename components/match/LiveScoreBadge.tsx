"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

interface LiveScoreBadgeProps {
  matchId: string
  initialScore: string
  initialMinute: string
  lang?: string
}

/**
 * ⚡ LiveScoreBadge
 * Composant client pour mettre à jour le score en temps réel via polling intelligent.
 */
export default function LiveScoreBadge({ matchId, initialScore, initialMinute, lang = 'fr' }: LiveScoreBadgeProps) {
  const [score, setScore] = useState(initialScore)
  const [minute, setMinute] = useState(initialMinute)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Polling toutes les 45 secondes pour économiser les ressources
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/matches')
        if (res.ok) {
          const data = await res.json()
          const match = data.matches.find((m: any) => m.id === matchId)
          
          if (match) {
            setScore(match.score)
            setMinute(match.minute)
            setIsLive(match.status === 'IN_PLAY' || match.status === 'LIVE')
          }
        }
      } catch (err) {
        console.error('Failed to poll live score')
      }
    }, 45000)

    return () => clearInterval(interval)
  }, [matchId])

  return (
    <div className="flex flex-col items-center">
      <div className="text-7xl font-black italic tracking-tighter text-white mb-2 tabular-nums">
        {score}
      </div>
      
      <div className="flex items-center gap-2">
        {isLive && (
          <div className="flex items-center gap-1.5 bg-red-600/20 text-red-500 px-2 py-0.5 rounded-md border border-red-500/30">
            <Activity size={12} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{minute}'</span>
          </div>
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          {lang === 'fr' ? 'Match en direct' : 'Live Match'}
        </span>
      </div>
    </div>
  )
}
