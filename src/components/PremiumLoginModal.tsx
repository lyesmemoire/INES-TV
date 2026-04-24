"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Crown, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PremiumLoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // or local API call

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pour synchroniser AuthContext avec local
      const res = await fetch("/api/auth/premium-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.reload(); // Recharge pour virer la pub immédiatement (SPA refresh)
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la connexion");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]">
        <motion.div
          className="bg-zinc-900/90 border border-white/5 p-8 rounded-3xl w-full max-w-sm relative shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
        >
          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
              <Crown className="text-emerald-500" size={24} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Accès Premium
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Connectez-vous pour un flux sans publicité.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email"
              className="p-3.5 rounded-xl bg-black border border-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              className="p-3.5 rounded-xl bg-black border border-white/5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button 
              disabled={loading}
              className="bg-emerald-500 py-3.5 rounded-xl hover:bg-emerald-400 font-black uppercase tracking-widest text-xs text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] mt-2 disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
