"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Zap, Shield, Tv, Star } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function PricingModal({ isOpen, onClose, onSuccess }: PricingModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/auth/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: 'PREMIUM_MONTHLY' })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user);
        setTimeout(onClose, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative p-8 sm:p-12">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-12">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/20 mb-6"
                >
                  <Crown size={14} />
                  StreamPerf Premium
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">
                  L'expérience ultime, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">sans compromis.</span>
                </h2>
                <p className="text-zinc-500 font-medium max-w-lg mx-auto">
                  Libérez toute la puissance de StreamPerf et profitez d'un streaming premium sur tous vos appareils.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-white uppercase mb-2 text-zinc-400">Gratuit</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">0€</span>
                      <span className="text-zinc-500 font-bold uppercase text-xs">/ à vie</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    <FeatureItem active={true} text="Accès aux chaines en direct" />
                    <FeatureItem active={false} text="Publicités (In-stream VAST)" />
                    <FeatureItem active={false} text="Multiplex non disponible" />
                    <FeatureItem active={false} text="Support Standard" />
                  </ul>

                  <button 
                    disabled 
                    className="w-full py-4 rounded-2xl bg-zinc-800 text-zinc-500 font-black uppercase text-sm cursor-not-allowed"
                  >
                    Plan Actuel
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="p-8 rounded-[2rem] bg-gradient-to-b from-indigo-600/10 to-indigo-600/5 border border-indigo-500/30 flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <Star className="text-indigo-400 animate-pulse" size={20} />
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-indigo-400 uppercase mb-2">Premium</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">9.99€</span>
                      <span className="text-zinc-400 font-bold uppercase text-xs">/ mois</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1 text-white">
                    <FeatureItem active={true} text="Zéro Publicité (Ad-Free)" isPremium />
                    <FeatureItem active={true} text="Qualité Ultra HD / 4K" isPremium />
                    <FeatureItem active={true} text="Multiplex & Multi-cam" isPremium />
                    <FeatureItem active={true} text="Support Prioritaire 24/7" isPremium />
                  </ul>

                  <button 
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Traitement..." : "Passer au Premium"}
                  </button>
                </div>
              </div>

              <p className="text-center mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                Annulation possible à tout moment. Sécurisé par Stripe.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ active, text, isPremium = false }: { active: boolean; text: string; isPremium?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`p-1 rounded-full ${active ? (isPremium ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white') : 'bg-red-500/10 text-red-500'}`}>
        {active ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
      </div>
      <span className={`text-sm font-bold ${active ? 'text-white' : 'text-zinc-600 line-through'}`}>{text}</span>
    </li>
  );
}
