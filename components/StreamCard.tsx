// components/StreamCard.tsx
// INES TV Design System — StreamCard conforme
// ─────────────────────────────────────────────────────

"use client"

import Link from "next/link"
import { Play } from "lucide-react"

interface StreamCardProps {
  homeTeam: string
  awayTeam: string
  score: string
  minute: string
  status: string
  league: string
  streamUrl?: string
  href?: string
}

export default function StreamCard({ 
  homeTeam, 
  awayTeam, 
  score, 
  minute, 
  status, 
  league, 
  streamUrl,
  href
}: StreamCardProps) {
  const isLive = status === "IN_PLAY" || status === "LIVE"
  const targetHref = href || `/watch/${homeTeam.toLowerCase().replace(/\s+/g, "_")}`

  return (
    <Link 
      href={targetHref}
      className="stream-card group"
    >
      {/* Badge Live / Status */}
      <div 
        className="absolute z-20 flex items-center gap-2"
        style={{ top: 'var(--space-4)', left: 'var(--space-4)' }}
      >
        <div className={`stream-card__badge ${isLive ? 'stream-card__badge--live' : 'stream-card__badge--status'}`}>
          {isLive ? "Live" : status}
        </div>
        {isLive && (
          <div 
            className="card__badge card__badge--tag"
            style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }}
          >
            {minute}'
          </div>
        )}
      </div>

      {/* League Badge */}
      <div 
        className="absolute z-20 card__badge card__badge--tag"
        style={{ top: 'var(--space-4)', right: 'var(--space-4)', opacity: 0.8 }}
      >
        {league}
      </div>

      {/* Match Visual */}
      <div className="stream-card__visual">
        <div 
          className="stream-card__team"
          style={{ background: 'linear-gradient(135deg, #001489, #000a4d)' }}
        >
          <div className="stream-card__logo-wrapper">
            {homeTeam.substring(0, 1)}
          </div>
        </div>
        <div 
          className="stream-card__team"
          style={{ background: 'linear-gradient(135deg, #e53238, #8b0000)' }}
        >
          <div className="stream-card__logo-wrapper">
            {awayTeam.substring(0, 1)}
          </div>
        </div>

        {/* Overlay Hover */}
        <div className="stream-card__overlay">
           <div className="stream-card__play-btn">
              <Play size={20} fill="currentColor" className="text-black ml-0.5" />
           </div>
        </div>

        {/* Score Overlay */}
        <div 
          className="absolute z-20 flex items-center gap-4"
          style={{ 
            bottom: 'var(--space-4)', 
            left: '50%', 
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
           <span className="text-lg font-black italic tracking-tighter" style={{ color: 'var(--color-text-primary)' }}>
             {score.split('-')[0]}
           </span>
           <span style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
           <span className="text-lg font-black italic tracking-tighter" style={{ color: 'var(--color-text-primary)' }}>
             {score.split('-')[1]}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="stream-card__content">
        <h3 className="stream-card__title">
          {homeTeam} vs {awayTeam}
        </h3>
        <p className="stream-card__meta">
          {league} • Matchday
        </p>
      </div>
    </Link>
  )
}
