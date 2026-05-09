'use client';

import { useAds } from './AdProvider';
import { X, RefreshCw, AlertCircle } from 'lucide-react';

export const SoftGate = () => {
  const { adblockDetected } = useAds();

  if (!adblockDetected) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 z-[100] rounded-xl border border-white/10 animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-orange-500" />
      </div>

      <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">
        Accès financé par la publicité
      </h2>

      <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
        <span className="text-white font-bold">INES TV</span> est un service gratuit financé par les annonces. 
        Pour regarder ce match en haute qualité, merci de désactiver votre bloqueur.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          J'ai désactivé mon bloqueur
        </button>
      </div>

      <p className="text-[10px] text-zinc-600 mt-8 uppercase tracking-[0.2em]">
        L'accès premium sans publicité arrive bientôt.
      </p>
    </div>
  );
};
