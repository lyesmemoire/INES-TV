"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function ResellerLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reseller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("resellerToken", data.token);
      localStorage.setItem("resellerInfo", JSON.stringify(data.reseller));
      window.location.href = "/reseller";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-violet-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 text-violet-400 mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reseller Portal</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign in to manage your users and credits</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              name="email"
              type="email"
              placeholder="Reseller Email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20"
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? "Signing in..." : "Access Portal"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-600">
          INES TV &mdash; Reseller Infrastructure &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
