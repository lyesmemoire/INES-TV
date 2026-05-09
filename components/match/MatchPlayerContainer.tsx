'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { PlayWithAdButton } from '../ads/PlayWithAdButton';
import SmartPlayer from '../player/SmartPlayer';

interface MatchPlayerContainerProps {
  lang: string;
  homeTeam: string;
  awayTeam: string;
  onPlay: () => void;
}

export default function MatchPlayerContainer({ lang, homeTeam, awayTeam, onPlay }: MatchPlayerContainerProps) {
  return (
    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl shadow-red-600/5 group">
      {/* Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div 
          onClick={onPlay}
          className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer transform transition group-hover:scale-110"
        >
          <Play size={32} fill="currentColor" className="ml-1 text-white" />
        </div>
        
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {lang === 'fr' ? 'Prêt à diffuser' : 'Ready to Stream'}
          </h3>
          <p className="text-zinc-500 text-sm mt-1">
            {lang === 'fr' 
              ? `Regardez ${homeTeam} vs ${awayTeam} en haute qualité` 
              : `Watch ${homeTeam} vs ${awayTeam} in high quality`}
          </p>
        </div>
        
        {/* Ad-integrated play button */}
        <PlayWithAdButton 
          lang={lang} 
          onPlayAction={onPlay} 
        />
      </div>
    </div>
  );
}
