import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Activity } from 'lucide-react';
import Image from 'next/image';
import { Channel } from '../../types';
import SportsDashboard from '../Dashboard/SportsDashboard';

interface MobileChannelRowProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

function MobileChannelRow({ channel, isActive, onClick }: MobileChannelRowProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
        isActive ? 'bg-emerald-500/10' : 'active:bg-white/5'
      }`}
    >
      {/* Logo / thumbnail */}
      <div className={`relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 flex items-center justify-center border ${
        isActive ? 'border-emerald-500/40' : 'border-white/5'
      }`}>
        {channel.homeLogo && channel.awayLogo ? (
          <div className="flex items-center justify-center gap-1 p-1 w-full h-full">
            <div className="relative w-5 h-5">
              <Image src={channel.homeLogo || "/placeholder.png"} alt="" fill className="object-contain" />
            </div>
            <span className="text-[8px] font-black text-zinc-600">vs</span>
            <div className="relative w-5 h-5">
              <Image src={channel.awayLogo || "/placeholder.png"} alt="" fill className="object-contain" />
            </div>
          </div>
        ) : (
          <Image src={channel.thumbnail || "/placeholder.png"} alt={channel.name} fill className="object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-bold leading-tight line-clamp-1 ${isActive ? 'text-white' : 'text-zinc-200'}`}>
          {channel.name}
        </p>
        {channel.currentProgram && (
          <p className="text-[10px] text-emerald-400 font-bold truncate mt-0.5 leading-none">
            {channel.currentProgram.title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{channel.category}</span>
          {channel.score && (
            <span className="text-[11px] font-black text-white tabular-nums">{channel.score}</span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
          <span className="w-1 h-1 rounded-full bg-red-500 live-dot" />LIVE
        </span>
        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
          <Activity size={8} />{channel.viewers}
        </span>
      </div>
    </motion.button>
  );
}

interface MobileViewProps {
  channels: Channel[];
  activeChannel: Channel;
  onSelect: (c: Channel) => void;
  isLoading: boolean;
  onRefresh: () => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

const CATEGORIES_MOBILE = ['Tout', 'Football', 'Basketball', 'Sports', 'News', 'Entertainment'];

export default function MobileChannelList({ channels, activeChannel, onSelect, isLoading, onRefresh, activeCategory, onCategoryChange }: MobileViewProps) {
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-base font-black text-white">
          TV en direct
          {!isLoading && <span className="text-xs font-medium text-zinc-500 ml-2">{channels.length}</span>}
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
        </button>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-white/5">
        {CATEGORIES_MOBILE.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-white/5 text-zinc-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Channel list */}
      <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        
        {['Tout', 'Football', 'Basketball', 'Sports'].includes(activeCategory) && (
          <div className="p-4 border-b border-white/5">
            <SportsDashboard 
              channels={channels.filter(c => ['Tout', 'Football', 'Basketball', 'Sports'].includes(activeCategory) ? (activeCategory === 'Tout' ? true : c.category === activeCategory) : true)} 
              onSelect={onSelect} 
            />
          </div>
        )}

        {activeCategory !== 'Football' && activeCategory !== 'Basketball' && activeCategory !== 'Sports' && (
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-14 h-14 rounded-xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 rounded-lg skeleton w-4/5" />
                    <div className="h-2.5 rounded-lg skeleton w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              channels.map(ch => (
                <MobileChannelRow
                  key={ch.id}
                  channel={ch}
                  isActive={activeChannel.id === ch.id}
                  onClick={() => onSelect(ch)}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
