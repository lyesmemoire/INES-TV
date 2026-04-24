"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

/**
 * 🔐 MAGIC LINK LOGIN PAGE
 * Passwordless, zero-friction onboarding.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard/slots"
        }
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      alert(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 font-sans selection:bg-blue-500/30">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="bg-slate-900 border border-white/5 p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">SP</div>
            <span className="text-xl font-black text-white uppercase tracking-tight">StreamPerf</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Passwordless login to your AdX console.</p>
        </div>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-4 text-emerald-400">✉️</div>
            <h2 className="text-emerald-400 font-bold mb-2">Magic Link Sent</h2>
            <p className="text-sm text-slate-400">Check your inbox for the login link. It expires in 5 minutes.</p>
            <button 
              onClick={() => setSent(false)} 
              className="mt-6 text-emerald-500 text-sm font-bold hover:underline"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Work Email</label>
              <input
                required
                type="email"
                placeholder="name@company.com"
                className="w-full px-5 py-3.5 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-white font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              By continued, you agree to our terms of service and high-performance commitment.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
