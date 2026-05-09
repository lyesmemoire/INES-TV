"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Calendar, Trophy, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Channel } from '@/src/types'
import { useAuth } from '@/src/context/AuthContext'
import { useLanguage } from '@/src/context/LanguageContext'

interface HeroLiveSectionProps {
  matches: Channel[]
  dict: any
}

export default function HeroLiveSection({ matches, dict }: HeroLiveSectionProps) {
  const { favorites, toggleFavorite } = useAuth();
  const { t, language } = useLanguage();

  // Pick the best match to feature: Live first, then first available
  const mainMatch = matches.find(m => m.status === 'LIVE' || m.status === 'IN_PLAY' || m.live) || matches[0]

  if (!mainMatch) return null

  const isFav = favorites.includes(mainMatch.id);

  // Generic placeholder for sports background
  const fallbackImage = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop"
  const bgImage = mainMatch.thumbnail || fallbackImage

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black">
      {/* Background with Parallel Parallax / Overlay */}
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt={`${mainMatch.homeTeam || mainMatch.name} vs ${mainMatch.awayTeam || ''}`}
          fill
          priority
          className="object-cover opacity-60 scale-105"
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-16 max-w-7xl mx-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          key={mainMatch.id}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              {t('navbar.live')}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
              <Trophy size={12} className="text-yellow-500" />
              {mainMatch.league || mainMatch.category}
            </span>
            {mainMatch.isPremium && (
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                PREMIUM
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] max-w-4xl drop-shadow-2xl">
            {mainMatch.homeTeam || mainMatch.homeName} <span className="text-red-600">vs</span> {mainMatch.awayTeam || mainMatch.awayName}
          </h1>

          {/* Score & Meta */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{t('hero.score') || 'Score Actuel'}</span>
              <span className="text-4xl md:text-6xl font-black italic tracking-tighter font-mono">
                {mainMatch.score || '0-0'}
              </span>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Match Time</span>
              <span className="text-4xl md:text-6xl font-black italic tracking-tighter text-red-600 font-mono">
                {mainMatch.matchTime || mainMatch.liveStats?.elapsedTime || 'LIVE'}
              </span>
            </div>
          </div>

          {/* CTA Group */}
          <div className="flex flex-wrap gap-4 pt-6">
            <Link
              href={`/${language}/watch/${mainMatch.slug || mainMatch.id}`}
              className="flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-red-600/20"
            >
              <Play size={18} fill="currentColor" />
              {t('hero.watchNow')}
            </Link>
            
            <button
              onClick={() => toggleFavorite(mainMatch.id, mainMatch)}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border ${
                isFav 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                : 'bg-white/5 backdrop-blur-xl text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <Star size={18} className={isFav ? 'fill-amber-500' : ''} />
              {isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Side Decorative Element */}
      <div className="absolute right-0 bottom-0 p-16 hidden xl:block pointer-events-none">
        <div className="text-[12rem] font-black text-white/5 select-none leading-none italic uppercase tracking-tighter">
          LIVE
        </div>
      </div>
    </section>
  )
}
