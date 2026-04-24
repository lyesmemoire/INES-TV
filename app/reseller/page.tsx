"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CreditCard, BarChart2, LogOut,
  Building2, PlusCircle, Trash2, AlertCircle, CheckCircle2, X
} from "lucide-react";

interface DashboardData {
  reseller: { id: string; name: string; email: string; credits: number };
  users: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalWatchTime: number;
  totalStreamEvents: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isPremium: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function ResellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("resellerToken") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    if (!token) { window.location.href = "/reseller/login"; return; }
    try {
      const [dash, userList] = await Promise.all([
        fetch("/api/reseller/dashboard", { headers }).then(r => r.json()),
        fetch("/api/reseller/users", { headers }).then(r => r.json()),
      ]);
      if (dash.error) { window.location.href = "/reseller/login"; return; }
      setData(dash);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch { window.location.href = "/reseller/login"; }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reseller/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password"), name: fd.get("name") }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      showToast("success", `User ${d.email} created!`);
      setShowCreate(false);
      (e.target as HTMLFormElement).reset();
      fetchData();
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Remove user ${email} from your account?`)) return;
    try {
      const res = await fetch(`/api/reseller/users/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      showToast("success", `${email} removed`);
      fetchData();
    } catch {
      showToast("error", "Failed to remove user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full"
        />
      </div>
    );
  }

  if (!data) return null;

  const creditPct = data.reseller.credits > 0
    ? Math.round((data.creditsUsed / data.reseller.credits) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-white/[0.02] backdrop-blur-md border-b border-white/10 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-violet-600/20">
            R
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">{data.reseller.name}</h2>
            <p className="text-xs text-gray-500 font-medium">{data.reseller.email}</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem("resellerToken"); window.location.href = "/reseller/login"; }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main className="pt-32 pb-12 px-8 max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-violet-400 mb-2">
            <Building2 size={15} />
            <span className="text-xs font-bold uppercase tracking-wider">Reseller Portal</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your users and monitor activity.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard title="Total Users" value={data.users} icon={<Users size={20} />} color="violet" />
          <StatCard title="Credits Left" value={data.creditsRemaining} icon={<CreditCard size={20} />} color="green" />
          <StatCard title="Watch Time (s)" value={data.totalWatchTime.toLocaleString()} icon={<Clock size={20} />} color="blue" />
          <StatCard title="Stream Events" value={data.totalStreamEvents} icon={<BarChart2 size={20} />} color="orange" />
        </div>

        {/* Credit usage bar */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-10">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-400 font-medium">Credit Usage</span>
            <span className="text-white font-bold">{data.creditsUsed} / {data.reseller.credits}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${creditPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${creditPct > 80 ? "bg-red-500" : creditPct > 50 ? "bg-yellow-500" : "bg-violet-500"}`}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{data.creditsRemaining} slots remaining</p>
        </div>

        {/* Users Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <h2 className="text-lg font-bold">My Users ({data.users})</h2>
            <button
              onClick={() => setShowCreate(v => !v)}
              disabled={data.creditsRemaining <= 0}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <PlusCircle size={16} /> Add User
            </button>
          </div>

          {/* Inline create form */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-white/5 overflow-hidden"
              >
                <form onSubmit={handleCreateUser} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium uppercase tracking-wider">Name</label>
                    <input name="name" placeholder="Optional" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium uppercase tracking-wider">Email *</label>
                    <input name="email" type="email" required placeholder="user@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block font-medium uppercase tracking-wider">Password *</label>
                    <input name="password" type="password" required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-3">
                    <button type="submit" disabled={createLoading} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all">
                      {createLoading ? "Creating..." : "Create User"}
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users list */}
          {users.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No users yet. Add your first user above.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-8 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name || u.email}</p>
                    {u.name && <p className="text-xs text-gray-500">{u.email}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      u.isBanned ? "bg-red-500/15 text-red-400"
                      : u.isPremium ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-white/5 text-gray-400"
                    }`}>
                      {u.isBanned ? "Banned" : u.role}
                    </span>
                    <span className="text-xs text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const c: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-400",
    green: "bg-green-500/10 text-green-400",
    blue: "bg-blue-500/10 text-blue-400",
    orange: "bg-orange-500/10 text-orange-400",
  };
  return (
    <motion.div whileHover={{ y: -4 }} className="p-5 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c[color]}`}>{icon}</div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}
