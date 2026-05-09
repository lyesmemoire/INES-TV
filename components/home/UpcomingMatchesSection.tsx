"use client"

import React from 'react'
import { Channel } from '@/src/types'
import MatchCard from './MatchCard'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

interface UpcomingMatchesSectionProps {
  matches: Channel[]
  dict: any
}

export default function UpcomingMatchesSection({ matches, dict }: UpcomingMatchesSectionProps) {
  // Filter for upcoming or scheduled matches
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING' || m.status === 'SCHEDULED')

  if (!upcomingMatches.length) return null

  return (
    <section className="py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <Calendar size={24} className="text-zinc-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Événements <span className="text-red-600">À Venir</span>
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Ne manquez pas les prochains chocs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all active:scale-95">
            Charger plus de matchs
          </button>
        </div>
      </div>
    </section>
  )
}
