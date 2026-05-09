import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Play, Trophy, Activity, Calendar } from 'lucide-react';
import { Channel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SportsDashboardProps {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
}

export default function SportsDashboard({ channels, onSelect }: SportsDashboardProps) {
  const { t } = useLanguage();

  const sportsChannels = useMemo(() => {
    return channels.filter(c => c.category === 'Football' || c.category === 'Basketball' || c.category === 'Sports' || c.homeName);
  }, [channels]);

  const liveMatches = sportsChannels.filter(c => c.status === 'LIVE' || (!c.status && c.score));
  const upcomingMatches = sportsChannels.filter(c => c.status === 'UPCOMING');
  
  const featuredMatch = liveMatches.length > 0 ? liveMatches[0] : upcomingMatches[0] || sportsChannels[0];

  if (!featuredMatch) return null;

  return (
    <div className="space-y-12">
      {/* Featured Match Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl"
      >
        {/* Abstract Stadium/Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-blue-900/20 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          {/* Top Label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/70 uppercase tracking-widest backdrop-blur-md">
              {featuredMatch.league || 'Featured Event'}
            </span>
            {featuredMatch.status === 'LIVE' && (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-black text-red-400 uppercase tracking-widest animate-pulse backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-center gap-6 md:gap-16 w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4 w-1/3">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image src={featuredMatch.homeLogo || featuredMatch.thumbnail || ""} alt={featuredMatch.homeName || "Home"} fill className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
              </div>
              <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">{featuredMatch.homeName || 'Home'}</h3>
            </div>

            {/* Score / Time */}
            <div className="flex flex-col items-center gap-2 w-1/3">
              <div className="text-5xl md:text-7xl font-black text-white tracking-widest font-mono drop-shadow-2xl">
                {featuredMatch.score || 'VS'}
              </div>
              <div className="text-sm md:text-base font-bold text-emerald-400 mt-2 bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20">
                {featuredMatch.matchTime || 'Upcoming'}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-4 w-1/3">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image src={featuredMatch.awayLogo || featuredMatch.thumbnail || ""} alt={featuredMatch.awayName || "Away"} fill className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
              </div>
              <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">{featuredMatch.awayName || 'Away'}</h3>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => onSelect(featuredMatch)}
            className="mt-12 group relative px-8 py-4 bg-emerald-500 text-black font-black text-lg rounded-full flex items-center gap-3 hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Play fill="black" size={20} />
            Watch Match
          </button>
        </div>
      </motion.div>

      {/* Grid sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Live Matches */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Activity className="text-red-500" />
            <h3 className="text-xl font-black tracking-tight">Live Matches</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {liveMatches.filter(m => m.id !== featuredMatch.id).map((match, i) => (
              <MatchCard key={match.id} match={match} onSelect={onSelect} i={i} />
            ))}
            {liveMatches.length <= 1 && (
              <p className="text-zinc-500 text-sm font-medium">No other live matches right now.</p>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="text-blue-500" />
            <h3 className="text-xl font-black tracking-tight">Upcoming</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {upcomingMatches.filter(m => m.id !== featuredMatch.id).map((match, i) => (
              <MatchCard key={match.id} match={match} onSelect={onSelect} i={i} />
            ))}
            {upcomingMatches.length === 0 && (
              <p className="text-zinc-500 text-sm font-medium">No upcoming matches scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onSelect, i }: { match: Channel; onSelect: (c: Channel) => void; i: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
      onClick={() => onSelect(match)}
      className="group w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 flex items-center justify-between transition-all backdrop-blur-sm"
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{match.league}</span>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image src={match.homeLogo ?? ""} alt={match.homeName || ""} fill className="object-contain" />
            </div>
            <span className="text-base font-bold text-white leading-none">{match.homeName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image src={match.awayLogo ?? ""} alt={match.awayName || ""} fill className="object-contain" />
            </div>
            <span className="text-base font-bold text-white leading-none">{match.awayName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {match.status === 'LIVE' ? (
          <div className="flex items-center gap-1.5 text-xs font-black text-red-500 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {match.matchTime}
          </div>
        ) : (
          <div className="text-xs font-bold text-zinc-500">{match.matchTime}</div>
        )}
        <div className="text-2xl font-black text-white font-mono tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
          {match.score || '-'}
        </div>
      </div>
    </motion.button>
  );
}
