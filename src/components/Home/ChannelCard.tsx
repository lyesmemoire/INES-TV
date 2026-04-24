import React from 'react';
import { motion } from 'framer-motion';
import { Play, Activity, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Channel } from '../../types';
import { getPrimaryStream } from '../../utils/streams/getPrimaryStream';
import VideoCore from '../Player/VideoCore';

const CATEGORY_COLORS: Record<string, string> = {
  football:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  basketball:    'bg-orange-500/10  text-orange-400  border-orange-500/20',
  news:          'bg-blue-500/10    text-blue-400    border-blue-500/20',
  sports:        'bg-cyan-500/10    text-cyan-400    border-cyan-500/20',
  entertainment: 'bg-purple-500/10  text-purple-400  border-purple-500/20',
  music:         'bg-pink-500/10    text-pink-400    border-pink-500/20',
  series:        'bg-violet-500/10  text-violet-400  border-violet-500/20',
  kids:          'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  comedy:        'bg-amber-500/10   text-amber-400   border-amber-500/20',
};

const getCategoryStyle = (cat: string) =>
  CATEGORY_COLORS[cat.toLowerCase()] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

export default function ChannelCard({ channel, isActive, index, onClick }: ChannelCardProps) {
  const { favorites, toggleFavorite } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const isFav = favorites.includes(channel.id);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered) {
      timer = setTimeout(() => setShowPreview(true), 800); // 800ms delay before preview
    } else {
      setShowPreview(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 card-hover ${
        isActive
          ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#09090b]'
          : 'hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-[#09090b]'
      }`}
    >
      {/* Thumbnail */}
      <div className={`aspect-video bg-zinc-900 relative overflow-hidden ${channel.isPremium ? 'ring-1 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}`}>


        {showPreview ? (
          /* PREVIEW VIDEO (Lightweight Dumb Renderer) */
          (() => {
            const stream = getPrimaryStream(channel);
            return stream ? (
              <VideoCore
                src={stream.url}
                type={stream.type}
              />
            ) : null;
          })()
        ) : (
          channel.homeLogo && channel.awayLogo ? (
            /* Match card: show logos vs */
            <div className="absolute inset-0 flex items-center justify-center gap-4 p-4 bg-gradient-to-br from-zinc-900 to-zinc-950">
              <img src={channel.homeLogo} alt="Home" className="w-14 h-14 object-contain drop-shadow-xl" />
              {channel.score ? (
                <span className="text-2xl font-black text-white tabular-nums tracking-widest drop-shadow-xl">
                  {channel.score}
                </span>
              ) : (
                <span className="text-sm font-black text-zinc-500">VS</span>
              )}
              <img src={channel.awayLogo} alt="Away" className="w-14 h-14 object-contain drop-shadow-xl" />
            </div>
          ) : (
            <img
              src={channel.thumbnail}
              alt={channel.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )
        )}

        {/* Overlay on hover (Play button) */}
        {!showPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play size={20} fill="black" className="text-black ml-0.5" />
            </div>
          </div>
        )}
        {/* 🔴 LIVE badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>

        {/* 💎 Premium badge */}
        {channel.isPremium && (
          <div className="absolute bottom-3 right-3 animate-pulse">
            <span className="flex items-center gap-1 bg-gradient-to-br from-amber-400 to-orange-600 text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow-xl border border-white/20">
              <Star size={10} fill="black" />
              PREMIUM
            </span>
          </div>
        )}


        {/* Star / Favorite toggle */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent opening the channel
              toggleFavorite(channel.id, channel);
            }}
            className="bg-black/40 hover:bg-black/80 backdrop-blur-md p-1.5 rounded-full transition-all"
          >
            <Star 
              size={16} 
              className={`transition-colors duration-300 ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300 hover:text-white'}`} 
            />
          </button>
        </div>

        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
        )}
      </div>

      {/* Card body */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors flex-1 flex items-center gap-1.5">
            {channel.name}
            {channel.isPremium && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
          </h3>

        </div>

        {channel.currentProgram && (
          <div className="mb-3 px-2 py-1 bg-emerald-500/5 rounded border border-emerald-500/10">
             <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter mb-0.5 opacity-80">En cours</p>
             <p className="text-[11px] text-zinc-300 font-bold truncate">{channel.currentProgram.title}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${getCategoryStyle(channel.category)}`}>
            {channel.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <Activity size={10} className="text-red-400" />
            {channel.viewers}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
