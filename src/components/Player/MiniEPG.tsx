import React, { useEffect, useRef } from 'react';
import { Channel } from '../../types';
import { motion } from 'motion/react';
import Image from 'next/image';

interface MiniEPGProps {
  channels: Channel[];
  currentChannelId: string;
  onSelect: (id: string) => void;
}

export default function MiniEPG({ channels, currentChannelId, onSelect }: MiniEPGProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected element
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentChannelId]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-4 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none"
    >
      <div 
        ref={containerRef}
        className="flex items-end gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide select-none px-4 md:px-10 pointer-events-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {channels.map((ch) => {
          const isCurrent = ch.id === currentChannelId;
          return (
            <div 
              key={ch.id} 
              data-active={isCurrent}
              onClick={() => onSelect(ch.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 ${isCurrent ? 'scale-110 opacity-100 z-10 mx-2' : 'scale-90 opacity-40 hover:opacity-100 mx-0'}`}
            >
              <div className={`w-16 h-16 md:w-28 md:h-28 rounded-2xl bg-zinc-950 border overflow-hidden flex flex-col relative items-center justify-center p-2 shadow-2xl ${isCurrent ? 'border-emerald-500 shadow-emerald-500/20' : 'border-white/10 hover:border-white/30'}`}>
                {ch.thumbnail || ch.homeLogo ? (
                  <div className="relative w-full h-full">
                    <Image src={(ch.thumbnail || ch.homeLogo) ?? ""} alt={ch.name} fill className="object-contain drop-shadow-md z-10" />
                  </div>
                ) : (
                  <span className="text-white/60 font-black text-xs uppercase z-10 text-center">{ch.name.substring(0, 10)}</span>
                )}
                {isCurrent && <div className="absolute inset-0 bg-emerald-500/10 z-0"></div>}
              </div>
              <p className={`text-[10px] md:text-xs font-bold truncate max-w-[80px] md:max-w-[100px] text-center ${isCurrent ? 'text-white drop-shadow-md' : 'text-zinc-500'}`}>
                {ch.name}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
