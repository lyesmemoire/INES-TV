"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Trophy, Star } from 'lucide-react'
import { Channel } from '@/src/types'
import { useAuth } from '@/src/context/AuthContext'
import { useLanguage } from '@/src/context/LanguageContext'

interface MatchCardProps {
  match: Channel
  variant?: 'premium' | 'standard'
}

export default function MatchCard({ match, variant = 'premium' }: MatchCardProps) {
  const { favorites, toggleFavorite } = useAuth();
  const { language } = useLanguage();
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.live
  const isFav = favorites.includes(match.id);
  
  // Si on a un slug, on va vers la page TV optimisée, sinon vers le player générique
  const suffix = language === 'fr' ? '-direct' : '-live';
  const href = match.slug 
    ? `/${language}/tv/${match.slug}${suffix}`
    : `/${language}/watch/${match.id}`;

  const getImage = (id: string) => {
    const images = [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518091043644-c1d445eb9519?q=80&w=600&auto=format&fit=crop"
    ]
    const idx = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return images[idx % images.length]
  }

  return (
    <div className="relative group min-w-[320px] md:min-w-[400px] first:ml-0">
      <Link 
        href={href}
        className="block"
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 transition-all duration-500 group-hover:border-red-600/50 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]">
          {/* Background Image */}
          <Image
            src={match.thumbnail || getImage(match.id)}
            alt={`${match.homeTeam || match.homeName} vs ${match.awayTeam || match.awayName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
          />

          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isLive ? (
              <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-red-600/20">
                Live
              </div>
            ) : (
              <div className="bg-zinc-800/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                À venir
              </div>
            )}
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
              <Trophy size={10} className="text-yellow-500" />
              {match.league || match.category}
            </div>
          </div>

          {/* Play Button Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
              <Play size={24} fill="currentColor" className="text-white ml-1" />
            </div>
          </div>

          {/* Content Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black italic uppercase tracking-tighter leading-tight truncate">
                {match.homeTeam || match.homeName} <span className="text-red-600 group-hover:text-white transition-colors">vs</span> {match.awayTeam || match.awayName}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  {isLive ? (
                    <span className="text-red-500">{match.matchTime || match.liveStats?.elapsedTime || ''} En cours</span>
                  ) : (
                    <span>Coup d'envoi à venir</span>
                  )}
                  <span>•</span>
                  <span className="text-white/60">{match.score || '0-0'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite Button (Outside Link to avoid nested interactivity) */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(match.id, match);
        }}
        className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md border transition-all duration-300 z-20 ${
          isFav 
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-lg' 
          : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star size={16} className={isFav ? 'fill-amber-500' : ''} />
      </button>
    </div>
  )
}

