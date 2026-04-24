"use client";

import { useState } from "react";
import { ShieldAlert, KeyRound, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });

      if (res.ok) {
        window.location.href = "/admin/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Login admin échoué. Vérifiez le code 2FA ou vos identifiants.");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden p-6">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <form
        onSubmit={handleAdminLogin}
        className="bg-zinc-900/80 backdrop-blur-2xl border border-red-500/20 p-10 rounded-3xl w-full max-w-sm flex flex-col gap-5 relative shadow-[0_0_50px_rgba(239,68,68,0.05)]"
      >
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15)] mb-4">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Admin Login</h2>
          <p className="text-[10px] uppercase font-black text-red-500/70 tracking-widest mt-1">Accès Sécurisé 2FA</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email Administrateur"
            className="w-full p-4 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-all text-sm font-medium"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-4 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-all text-sm font-medium"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="relative">
            <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Code Google Auth (2FA)"
              className="w-full p-4 pl-11 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition-all text-sm font-mono tracking-widest"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] mt-4 disabled:opacity-50"
        >
          {loading ? "Vérification..." : "Entrer en zone Admin"}
        </button>
      </form>
    </div>
  );
}
