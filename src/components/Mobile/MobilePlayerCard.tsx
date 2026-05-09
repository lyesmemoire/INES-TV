import { motion } from 'motion/react';
import Image from 'next/image';
import { Play, Clock, Activity, ChevronRight, Star } from 'lucide-react';
import { Channel } from '../../types';

interface MobilePlayerCardProps {
  channel: Channel;
  isPlaying: boolean;
  onPlay: () => void;
  onFavorite?: () => void;
}

export default function MobilePlayerCard({ channel, isPlaying, onPlay, onFavorite }: MobilePlayerCardProps) {
  return (
    <motion.div
      key={channel.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-4 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl"
    >
      {/* Thumbnail with gradient */}
      <div className="relative aspect-video">
        {channel.homeLogo && channel.awayLogo ? (
          <div className="absolute inset-0 flex items-center justify-center gap-6 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6">
            <div className="relative w-16 h-16">
              <Image src={channel.homeLogo || "/placeholder.png"} alt="Home" fill className="object-contain drop-shadow-xl" />
            </div>
            <div className="flex flex-col items-center">
              {channel.score ? (
                <span className="text-4xl font-black text-white tabular-nums tracking-widest">{channel.score}</span>
              ) : (
                <span className="text-lg font-black text-zinc-500">VS</span>
              )}
              {channel.liveStats?.elapsedTime && (
                <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                  {channel.liveStats.elapsedTime}
                </span>
              )}
            </div>
            <div className="relative w-16 h-16">
              <Image src={channel.awayLogo || "/placeholder.png"} alt="Away" fill className="object-contain drop-shadow-xl" />
            </div>
          </div>
        ) : (
          <Image src={channel.thumbnail || "/placeholder.png"} alt={channel.name} fill className="object-cover" />
        )}

        {/* Overlay top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Live badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />LIVE
        </div>

        {/* Center play button */}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 ${
            isPlaying ? 'bg-white/10 scale-90' : 'bg-white scale-100'
          }`}>
            <Play size={24} fill={isPlaying ? 'white' : 'black'} className={`${isPlaying ? 'text-white' : 'text-black'} ml-1`} />
          </div>
        </button>
      </div>

      {/* Info card */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
              {channel.category}
            </span>
            <h2 className="text-lg font-black text-white mt-2 leading-tight line-clamp-2">
              {channel.name}
            </h2>
          </div>
          <button
            onClick={onFavorite}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all shrink-0"
          >
            <Star size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-red-400" />
            <span className="font-bold text-zinc-300">{channel.viewers}</span> spectateurs
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {channel.liveStats?.elapsedTime ?? 'En cours'}
          </span>
        </div>

        {/* Key players teaser */}
        {channel.liveStats?.keyPlayers && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-medium">
              {channel.liveStats.keyPlayers.slice(0, 2).join(', ')}
            </span>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
