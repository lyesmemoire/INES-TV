import { Play, Clock, Activity, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Channel } from '../../types/index';
import VideoPlayer from '../Player/Player';
import { DeviceTier, NetworkQuality, NetworkType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeroProps {
  channel: Channel;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (r: number) => void;
  tier: DeviceTier;
  networkQuality: NetworkQuality;
  networkType: NetworkType;
  metrics: { resolution: string; bitrate: string; fps: number; buffer: string };
  onMetricsUpdate: (m: { resolution: string; bitrate: string; fps: number }) => void;
}

export default function Hero({
  channel, isPlaying, setIsPlaying, playbackRate, setPlaybackRate,
  tier, networkQuality, networkType, metrics, onMetricsUpdate
}: HeroProps) {
  // 🛡️ v4 Hardening: Render guard to prevent flicker and hydration mismatch
  if (!channel) return null;

  const { favorites, toggleFavorite } = useAuth();
  const { t } = useLanguage();
  const isFav = favorites.includes(channel.id);
  return (
    <section className="relative w-full" style={{ height: 'min(56.25vw, 540px)' }}>
      {/* Full-bleed video */}
      <div className="absolute inset-0 bg-black overflow-hidden">
        <VideoPlayer
          channelId={channel.id}
          currentChannel={channel}
          streamUrl={channel.streamUrl}
          poster={channel.thumbnail}
          onError={(msg) => console.error(msg)}
        />
        {/* Cinematic gradient overlay suite */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
      </div>



      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 md:pb-16 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          key={channel.id}
        >
          {/* Live badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
              {t('navbar.live')}
            </span>

            <span className="text-sm font-semibold text-zinc-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              {channel.category}
            </span>
            {channel.isPremium && (
              <span className="flex items-center gap-1.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-black text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-white/20">
                <Star size={12} fill="black" />
                PREMIUM
              </span>
            )}
          </div>


          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-2xl">
            {channel.name}
          </h1>

          {/* Score if available */}
          {channel.score && channel.homeLogo && channel.awayLogo && (
            <div className="flex items-center gap-4 mb-5 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl w-fit">
              <img src={channel.homeLogo} alt="Home" className="w-10 h-10 object-contain" />
              <span className="text-3xl font-black text-white tracking-widest tabular-nums">{channel.score}</span>
              <img src={channel.awayLogo} alt="Away" className="w-10 h-10 object-contain" />
            </div>
          )}

          {/* Stats row with Glassmorphism */}
          <div className="flex items-center gap-5 text-xs text-zinc-400 mb-8 p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full w-fit px-5 shadow-2xl">
            <span className="flex items-center gap-1.5 py-1">
              <Activity size={14} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="font-black text-white">{channel.viewers || '0'}</span>
              <span className="uppercase tracking-tighter text-[10px] opacity-60">Spectateurs</span>
            </span>
            <div className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
              <span className="font-black text-blue-400 uppercase tracking-widest text-[9px] drop-shadow-sm">4K ULTRA HDR</span>
            </span>
            <div className="w-px h-4 bg-white/10" />
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-500" />
              <span className="uppercase tracking-widest text-[9px] font-bold">{(channel as any).liveStats?.elapsedTime ?? 'DIRECT'}</span>
            </span>
          </div>


          {/* CTA Group */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group relative flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play size={22} fill="currentColor" />
              <span className="uppercase tracking-widest text-xs">
                {isPlaying ? (t('hero.watchNow') + '...') : t('hero.watchNow')}
              </span>
            </button>
            
            <button
              onClick={() => toggleFavorite(channel.id, channel)}
              className={`flex items-center gap-3 font-black px-6 py-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                isFav 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              <Star size={20} className={isFav ? 'fill-amber-500' : ''} />
              <span className="uppercase tracking-widest text-[10px]">
                {isFav ? 'Retirer' : 'Ajouter'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
