'use client';

import React, { useState, useEffect } from 'react';

interface MatchStatusIndicatorProps {
  status: string;
  scheduledAt?: string | Date;
  isFr: boolean;
}

export default function MatchStatusIndicator({ status, scheduledAt, isFr }: MatchStatusIndicatorProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (status !== 'UPCOMING' || !scheduledAt) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status, scheduledAt]);

  const wrapperClass = "inline-flex items-center justify-center w-[140px] h-[28px] rounded-lg text-xs font-black uppercase tracking-widest transition-colors";

  const liveBadge = (
    <span className={`${wrapperClass} bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] gap-2`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      {isFr ? 'En Direct' : 'Live'}
    </span>
  );

  if (status === 'LIVE' || status === 'IN_PLAY') {
    return liveBadge;
  }

  if (status === 'FINISHED' || status === 'ENDED') {
    return (
      <span className={`${wrapperClass} bg-zinc-800 text-zinc-400 border border-white/10`}>
        {isFr ? 'Terminé' : 'Finished'}
      </span>
    );
  }

  if (status === 'UPCOMING' && scheduledAt) {
    if (now === null) {
      // Hydration safety: Return skeleton/placeholder with exact same dimensions
      return (
        <span className={`${wrapperClass} bg-white/10 text-white/30 border border-white/20 tabular-nums`}>
          --:--:--
        </span>
      );
    }

    const target = new Date(scheduledAt).getTime();
    const diff = target - now;

    // If countdown hits zero or past, render LIVE
    if (diff <= 0) {
      return liveBadge;
    }

    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    const h = Math.floor(diff / (1000 * 60 * 60));

    const isLessThanOneMinute = diff < 60000;
    const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return (
      <span className={`${wrapperClass} tabular-nums gap-1.5 ${
        isLessThanOneMinute 
          ? 'bg-red-600/20 text-red-500 border border-red-500/30 shadow-[0_0_8px_rgba(220,38,38,0.3)]' 
          : 'bg-white/10 text-white border border-white/20'
      }`}>
        <span>{isFr ? 'Dans' : 'In'}</span>
        <span>{formattedTime}</span>
      </span>
    );
  }

  // Fallback
  return (
    <span className={`${wrapperClass} bg-white/10 text-white border border-white/20`}>
      {status}
    </span>
  );
}
