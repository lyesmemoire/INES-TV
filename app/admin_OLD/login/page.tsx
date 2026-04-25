"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Key, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Initial Login
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.requires2FA) {
        // Step 2: 2FA Verification (Sync check)
        if (!code) {
            setError("Code 2FA requis");
            setLoading(false);
            return;
        }
        const res2 = await fetch("/api/admin/2fa/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminId: data.adminId, code }),
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error || "Code 2FA invalide");
        
        localStorage.setItem("adminToken", data2.token);
        // Set cookie for middleware sync (Phase 58)
        document.cookie = `admin_token=${data2.token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        localStorage.setItem("adminToken", data.token);
        // Set cookie for middleware sync (Phase 58)
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111827] p-10 rounded-2xl shadow-2xl border border-gray-800/50"
      >
        <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded shadow-lg shadow-indigo-600/20 flex items-center justify-center font-black text-xl text-white mb-4">S</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Stripe-style secure infrastructure</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Email</p>
                <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@streamperf.com"
                        className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-white placeholder-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
                        required 
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Password</p>
                <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-white placeholder-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
                        required 
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">2FA Code (Optional)</p>
                <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000 000"
                        className="w-full bg-black border border-gray-800 rounded-lg py-3 pl-12 pr-4 text-sm text-white placeholder-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 mt-6 disabled:opacity-50"
            >
                {loading ? "Authenticating..." : "Login"}
            </button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-indigo-500" />
            <span>Encrypted Session Management</span>
        </div>
      </motion.div>
    </div>
  );
}

function ShieldCheck(props: any) {
    return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
}
