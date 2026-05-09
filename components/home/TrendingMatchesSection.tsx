"use client"

import React from 'react'
import { Channel } from '@/src/types'
import MatchCard from './MatchCard'
import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
interface TrendingMatchesSectionProps {
  matches: Channel[]
  dict: any
}

export default function TrendingMatchesSection({ matches, dict }: TrendingMatchesSectionProps) {
  // Mocking "Trending" by taking 3 matches that are not in the main featured hero
  const trendingMatches = matches.slice(1, 4)

  if (!trendingMatches.length) return null

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-[0.3em] text-xs">
            <TrendingUp size={16} />
            <span>Top Player</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Tendances <span className="text-red-600">Globales</span>
          </h2>
          <p className="text-zinc-500 max-w-xl font-medium">
            Les matchs les plus regardés sur INES TV en ce moment. Analytics basés sur le trafic temps réel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {trendingMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
            >
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
