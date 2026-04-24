'use client';

import Link from 'next/link';
import { ShieldOff, Home, Lock } from 'lucide-react';

export default function AccessRestrictedPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.15)]">
              <ShieldOff size={40} className="text-red-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <Lock size={14} className="text-red-400" />
            </div>
          </div>
        </div>

        {/* Error code */}
        <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.3em] mb-3">
          Erreur 403 — Accès Refusé
        </p>

        {/* Title */}
        <h1 className="text-4xl font-black text-white tracking-tight mb-4">
          Accès Restreint
        </h1>

        {/* Description */}
        <p className="text-zinc-400 text-base font-medium leading-relaxed mb-8">
          Cette section est réservée aux administrateurs de la plateforme.
          Vous n'avez pas les privilèges nécessaires pour accéder à cette page.
        </p>

        {/* Info box */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-2">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Informations</p>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rôle requis : <span className="text-red-400 font-bold ml-1">ADMIN</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Home size={16} />
          Retour à l'accueil
        </Link>

        {/* Footer note */}
        <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-8">
          StreamPerf Pro — Accès Sécurisé
        </p>
      </div>
    </div>
  );
}
