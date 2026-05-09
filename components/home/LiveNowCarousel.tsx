"use client"

import React from 'react'
import { Channel } from '@/src/types'
import MatchCard from './MatchCard'
import { motion } from 'framer-motion'

interface LiveNowCarouselProps {
  matches: Channel[]
  dict: any
}

export default function LiveNowCarousel({ matches, dict }: LiveNowCarouselProps) {
  const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'IN_PLAY')

  if (!liveMatches.length) return null

  return (
    <section className="py-12 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
              🔴 En Direct <span className="text-red-600">Maintenant</span>
            </h2>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/10 pb-1 cursor-pointer hover:text-red-600 hover:border-red-600 transition-all">
            Voir tous les scores
          </div>
        </div>
      </div>

      <div className="relative group">
        <div 
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 md:px-[calc((100vw-1280px)/2+24px)] pb-8"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {liveMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={{ scrollSnapAlign: 'start' }}
            >
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>

        {/* Shadow Overlays for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
