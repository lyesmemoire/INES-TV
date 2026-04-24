"use client";

import { useState } from "react";
import { Crown, AlertCircle } from "lucide-react";

export default function PremiumLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/premium-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/premium"; // redirection vers l'app SPA
      } else {
        const data = await res.json();
        setError(data.error || "Login échoué. Veuillez vérifier vos identifiants.");
      }
    } catch {
      setError("Erreur réseau de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-2xl p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Crown size={20} />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Accès Premium</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      
      <button 
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-50 mt-2"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <div className="mt-4 text-center">
        <p className="text-zinc-500 text-xs">
          Les utilisateurs gratuits peuvent naviguer sur la plateforme via un ticket standard.
        </p>
      </div>
    </form>
  );
}
