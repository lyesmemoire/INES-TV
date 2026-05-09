import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronRight, ChevronLeft, Activity, Clock } from 'lucide-react';
import Image from 'next/image';
import Hls from 'hls.js';
import { Channel, DeviceTier, NetworkQuality, NetworkType } from '../../types';
import { getPrimaryStream } from '../../utils/streams/getPrimaryStream';

/** 
 * TV Layout — Google TV / Android TV design
 * 
 * Key principles for "10-foot UI":
 * - Large text and targets (readable from 3m away)
 * - Full keyboard / D-Pad navigation (arrow keys + Enter)
 * - No hover-only interactions — everything is focus-based
 * - Minimal clutter: one primary action at a time
 */

// ── D-Pad focus hook ──────────────────────────────────────────────────────────
function useDPad(itemCount: number, initial = 0) {
  const [focused, setFocused] = useState(initial);

  const handleKey = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocused(f => Math.min(f + 1, itemCount - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocused(f => Math.max(f - 1, 0));
        break;
    }
  }, [itemCount]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return [focused, setFocused] as const;
}

// ── Mini HLS player for TV Hero ───────────────────────────────────────────────
// ── Mini HLS player for TV Hero ───────────────────────────────────────────────
function TvVideoPlayer({ channel, isPlaying }: { channel: Channel; isPlaying: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current || !channel) return;
    const stream = getPrimaryStream(channel);
    const streamUrl = stream?.url;
    if (!streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, maxBufferLength: 10 });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) videoRef.current?.play().catch(() => {});
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = streamUrl;
    }
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [channel?.id, channel?.streamSources, channel?.streamUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      playsInline
      poster={channel.logo || channel.thumbnail}
    />
  );
}

// ── TV Channel Row ────────────────────────────────────────────────────────────
interface TvChannelRowProps {
  channel: Channel;
  isFocused: boolean;
  isActive: boolean;
  index: number;
  onSelect: () => void;
  onFocus: () => void;
}

function TvChannelRow({ channel, isFocused, isActive, index, onSelect, onFocus }: TvChannelRowProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.focus();
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFocused]);

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      onFocus={onFocus}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      tabIndex={isFocused ? 0 : -1}
      className={`w-full flex items-center gap-5 px-6 py-4 text-left transition-all duration-200 outline-none rounded-2xl ${
        isFocused
          ? 'bg-white text-black scale-[1.02] shadow-2xl shadow-white/10'
          : isActive
          ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
          : 'text-zinc-300 hover:bg-zinc-800/40'
      }`}
    >
      {/* Logo */}
      <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
        isFocused ? 'bg-black/10' : 'bg-zinc-800'
      }`}>
        <Image src={channel.logo || channel.thumbnail || "/placeholder.png"} alt={channel.name} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-lg font-black leading-tight line-clamp-1 ${isFocused ? 'text-black' : 'text-white'}`}>
          {channel.name}
        </p>
        
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs font-bold uppercase tracking-widest ${isFocused ? 'text-black/60' : 'text-zinc-500'}`}>
            {channel.category}
          </span>
          <span className={`text-xs font-medium ${isFocused ? 'text-black/50' : 'text-zinc-500'}`}>
            {channel.viewers}
          </span>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="shrink-0">
         <div className={`w-2 h-2 rounded-full ${isFocused ? 'bg-red-600' : 'bg-red-500'} live-dot`} />
      </div>

      {isFocused && <ChevronRight size={22} className="text-black/40 shrink-0" />}
    </motion.button>
  );
}

// ── Main TV Layout ────────────────────────────────────────────────────────────
interface TvLayoutProps {
  channels: Channel[];
  activeChannel: Channel;
  onSelect: (c: Channel) => void;
  isLoading: boolean;
  tier: DeviceTier;
  networkQuality: NetworkQuality;
  networkType: NetworkType;
}

export default function TvLayout({ channels, activeChannel, onSelect, isLoading, tier, networkQuality, networkType }: TvLayoutProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showEpg, setShowEpg] = useState(true);
  const [focusZone, setFocusZone] = useState<'player' | 'epg'>('epg');
  
  const [activeCategory, setActiveCategory] = useState('Sports');
  const categories = ['Sports', 'Movies', 'Kids', 'News', 'Religion', 'General'];

  const filteredChannels = useMemo(() => {
    return channels.filter(c => c.category === activeCategory);
  }, [channels, activeCategory]);

  const [focusedIdx, setFocusedIdx] = useDPad(filteredChannels.length, 0);

  // Sync focused index when category changes
  useEffect(() => {
    setFocusedIdx(0);
  }, [activeCategory, setFocusedIdx]);

  // Player zone keybinds
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle Play/Pause
      if (e.key === ' ' || e.key === 'p') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
      
      // Category Switching (Ch+ / Ch-)
      if (e.key === 'PageUp' || e.key === 'w') {
        const idx = categories.indexOf(activeCategory);
        setActiveCategory(categories[(idx - 1 + categories.length) % categories.length]);
      }
      if (e.key === 'PageDown' || e.key === 's') {
        const idx = categories.indexOf(activeCategory);
        setActiveCategory(categories[(idx + 1) % categories.length]);
      }

      if (e.key === 'ArrowLeft') {
        if (!showEpg) {
            e.preventDefault();
            setShowEpg(true);
            setFocusZone('epg');
        } else {
            // Cycle category left
            const idx = categories.indexOf(activeCategory);
            setActiveCategory(categories[(idx - 1 + categories.length) % categories.length]);
        }
      }

      if (e.key === 'ArrowRight' && showEpg) {
        e.preventDefault();
        setShowEpg(false);
        setFocusZone('player');
      }

      if (e.key === 'Enter' && focusZone === 'epg') {
        e.preventDefault();
        onSelect(filteredChannels[focusedIdx]);
        setFocusZone('player');
        setShowEpg(false);
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        setShowEpg(true);
        setFocusZone('epg');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusZone, showEpg, focusedIdx, filteredChannels, activeCategory, onSelect]);

  // Auto-select focused channel (Preview mode)
  useEffect(() => {
    if (filteredChannels[focusedIdx]) {
      onSelect(filteredChannels[focusedIdx]);
    }
  }, [focusedIdx, filteredChannels]);

  return (
    <div className="fixed inset-0 bg-black flex overflow-hidden select-none" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ── Left: Video Player ─────────────────────────────────────────────── */}
      <div
        className={`relative flex-1 transition-all duration-500 ease-in-out ${showEpg ? '' : 'w-full'}`}
        onClick={() => setFocusZone('player')}
      >
        {/* Background video */}
        <div className="absolute inset-0">
          <TvVideoPlayer channel={activeChannel} isPlaying={isPlaying} />
          {/* Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-black font-black text-sm">SP</span>
            </div>
            <span className="text-white text-xl font-black tracking-tight">INES TV</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">{tier}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">{networkQuality}</span>
          </div>
        </div>

        {/* Channel info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChannel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl"
            >
              {/* Live badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-2 bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-white live-dot" />LIVE
                </span>
                {activeChannel.liveStats?.elapsedTime && (
                  <span className="text-white/70 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Clock size={14} />{activeChannel.liveStats.elapsedTime}
                  </span>
                )}
              </div>

              {/* Score if match */}
              {activeChannel.score && activeChannel.homeLogo && activeChannel.awayLogo && (
                <div className="flex items-center gap-6 mb-4 p-4 bg-black/60 backdrop-blur-md rounded-2xl w-fit border border-white/10">
                  <div className="relative w-14 h-14">
                    <Image src={activeChannel.homeLogo} alt="" fill className="object-contain drop-shadow-xl" />
                  </div>
                  <span className="text-5xl font-black text-white tabular-nums tracking-widest">{activeChannel.score}</span>
                  <div className="relative w-14 h-14">
                    <Image src={activeChannel.awayLogo} alt="" fill className="object-contain drop-shadow-xl" />
                  </div>
                </div>
              )}

              <h1 className="text-4xl font-black text-white leading-tight mb-2 drop-shadow-2xl">
                {activeChannel.name}
              </h1>
              <p className="text-lg text-white/50 font-semibold mb-6">{activeChannel.category}</p>

              {/* Controls hint */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl font-black text-lg transition-all duration-200 ${
                    focusZone === 'player'
                      ? 'bg-white text-black ring-4 ring-white/30 scale-105 shadow-2xl'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                  {isPlaying ? 'En cours' : 'Lecture'}
                </button>

                <button
                  onClick={() => { setShowEpg(true); setFocusZone('epg'); }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 text-white/70 border border-white/10 font-bold text-base hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={18} />Chaînes
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* D-Pad hint */}
        {focusZone === 'player' && (
          <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-xs font-bold tracking-widest uppercase rotate-90 mb-1">◄ Chaînes</span>
          </div>
        )}
      </div>

      {/* ── Right: EPG Channel List ────────────────────────────────────────── */}
      <AnimatePresence>
        {showEpg && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="w-[480px] shrink-0 bg-zinc-950/90 backdrop-blur-2xl border-l border-white/5 flex flex-col"
          >
            {/* EPG header */}
            <div className="px-8 pt-8 pb-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeCategory}</h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                  <span className="text-[10px] font-black text-white/50">{categories.indexOf(activeCategory) + 1}/{categories.length}</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                {filteredChannels.length} chaîne{filteredChannels.length !== 1 ? 's' : ''} · <span className="text-emerald-400">↑↓ Naviguer</span>
              </p>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 px-6 py-4 rounded-2xl">
                    <div className="w-16 h-16 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 rounded-lg skeleton w-4/5" />
                      <div className="h-3 rounded-lg skeleton w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                channels.map((ch, i) => (
                  <TvChannelRow
                    key={ch.id}
                    channel={ch}
                    isFocused={focusedIdx === i && focusZone === 'epg'}
                    isActive={activeChannel.id === ch.id}
                    index={i}
                    onSelect={() => { onSelect(ch); setFocusZone('player'); }}
                    onFocus={() => setFocusedIdx(i)}
                  />
                ))
              )}
            </div>

            {/* Bottom hint */}
            <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-600 font-bold">
              <span>↑↓ Naviguer</span>
              <span>↵ Regarder</span>
              <span>→ Fermer</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
