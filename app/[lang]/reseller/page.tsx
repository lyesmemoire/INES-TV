"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CreditCard, BarChart2, LogOut,
  Building2, PlusCircle, Trash2, AlertCircle, CheckCircle2, X, Tv
} from "lucide-react";
import Link from "next/link";

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
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setToken(localStorage.getItem("resellerToken"))
  }, [])

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

  useEffect(() => { if (mounted && token !== null) fetchData(); }, [mounted, token]);

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
      showToast("success", `Utilisateur ${d.email} créé !`);
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
    if (!confirm(`Supprimer l'utilisateur ${email} ?`)) return;
    try {
      const res = await fetch(`/api/reseller/users/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      showToast("success", `${email} supprimé`);
      fetchData();
    } catch {
      showToast("error", "Échec de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-base)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 rounded-full"
          style={{ borderColor: 'rgba(245, 166, 35, 0.2)', borderTopColor: 'var(--color-action-primary)' }}
        />
      </div>
    );
  }

  if (!data) return null;

  const creditPct = data.reseller.credits > 0
    ? Math.round((data.creditsUsed / data.reseller.credits) * 100)
    : 0;

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-semibold"
            style={{ 
              backgroundColor: toast.type === "success" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(214, 59, 47, 0.1)',
              borderColor: toast.type === "success" ? 'rgba(16, 185, 129, 0.2)' : 'rgba(214, 59, 47, 0.2)',
              color: toast.type === "success" ? '#10b981' : 'var(--color-action-danger)'
            }}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="nav-bar fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg"
            style={{ backgroundColor: 'var(--color-action-primary)', color: 'var(--color-text-tertiary)' }}
          >
            ITV
          </div>
          <div>
            <h2 className="font-bold text-md tracking-tight">{data.reseller.name}</h2>
            <p style={{ fontSize: '10px', color: 'var(--color-text-inverse)', fontWeight: 'bold' }}>{data.reseller.email}</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem("resellerToken"); window.location.href = "/reseller/login"; }}
          className="link flex items-center gap-2"
          style={{ textDecoration: 'none', color: 'var(--color-text-inverse)' }}
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </nav>

      <main className="pt-32 pb-12 px-8 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-action-primary)' }}>
            <Building2 size={15} />
            <span className="text-xs font-bold uppercase tracking-widest">Portail Revendeur</span>
          </div>
          <h1 className="hero__title" style={{ fontSize: 'var(--font-size-2xl)' }}>Mon Tableau de Bord</h1>
          <p style={{ color: 'var(--color-text-inverse)', marginTop: 'var(--space-2)' }}>Gérez vos utilisateurs et surveillez l'activité.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Utilisateurs" value={data.users} icon={<Users size={20} />} />
          <StatCard title="Crédits" value={data.creditsRemaining} icon={<CreditCard size={20} />} highlight />
          <StatCard title="Visionnage (s)" value={data.totalWatchTime.toLocaleString()} icon={<Clock size={20} />} />
          <StatCard title="Événements" value={data.totalStreamEvents} icon={<BarChart2 size={20} />} />
        </div>

        {/* Credit usage bar */}
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
          <div className="flex justify-between items-center mb-4">
            <span style={{ color: 'var(--color-text-inverse)', fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>Utilisation des crédits</span>
            <span style={{ fontWeight: 900 }}>{data.creditsUsed} / {data.reseller.credits}</span>
          </div>
          <div 
            className="w-full rounded-full h-3 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface-base)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${creditPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ 
                backgroundColor: creditPct > 80 ? 'var(--color-action-danger)' : 'var(--color-action-primary)' 
              }}
            />
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-inverse)', marginTop: 'var(--space-2)', fontWeight: 'bold' }}>
            {data.creditsRemaining} slots restants
          </p>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div 
            className="flex items-center justify-between px-8 py-6"
            style={{ borderBottom: '1px solid var(--color-surface-raised)' }}
          >
            <h2 className="text-lg font-bold">Mes Utilisateurs ({data.users})</h2>
            <button
              onClick={() => setShowCreate(v => !v)}
              disabled={data.creditsRemaining <= 0}
              className="btn btn--primary"
              style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-sm)' }}
            >
              <PlusCircle size={16} /> Ajouter
            </button>
          </div>

          {/* Inline create form */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
                style={{ borderBottom: '1px solid var(--color-surface-raised)' }}
              >
                <form onSubmit={handleCreateUser} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="input-group">
                    <label className="input-label">Nom</label>
                    <input name="name" placeholder="Optionnel" className="input-field" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input name="email" type="email" required placeholder="user@example.com" className="input-field" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Mot de passe *</label>
                    <input name="password" type="password" required placeholder="••••••••" className="input-field" />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-4">
                    <button type="submit" disabled={createLoading} className="btn btn--primary">
                      {createLoading ? "Création..." : "Créer l'utilisateur"}
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)} className="btn btn--ghost" style={{ minWidth: 'auto' }}>
                      <X size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Users list */}
          {users.length === 0 ? (
            <div className="py-20 text-center" style={{ color: 'var(--color-text-inverse)' }}>
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun utilisateur pour le moment.</p>
            </div>
          ) : (
            <div className="list-container">
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="list-item"
                  style={{ padding: 'var(--space-4) var(--space-8)' }}
                >
                  <div className="list-item-content">
                    <p className="list-item-title">{u.name || u.email}</p>
                    {u.name && <p className="list-item-description">{u.email}</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    <span 
                      className="card-tag"
                      style={{ 
                        backgroundColor: u.isBanned ? 'var(--color-action-danger)' : u.isPremium ? 'var(--color-action-primary)' : 'var(--color-surface-raised)',
                        color: (u.isBanned || u.isPremium) ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)'
                      }}
                    >
                      {u.isBanned ? "Banni" : u.role}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-inverse)', fontWeight: 'bold' }}>
                      {mounted ? new Date(u.createdAt).toLocaleDateString() : ''}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="btn btn--ghost"
                      style={{ minWidth: 'auto', padding: 'var(--space-2)', color: 'var(--color-action-danger)' }}
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

function StatCard({ title, value, icon, highlight = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      className="card"
      style={{ 
        padding: 'var(--space-6)',
        border: highlight ? '1px solid var(--color-action-primary)' : '1px solid var(--color-surface-raised)'
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ 
          backgroundColor: highlight ? 'rgba(245, 166, 35, 0.1)' : 'var(--color-surface-base)',
          color: highlight ? 'var(--color-action-primary)' : 'var(--color-text-inverse)'
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-inverse)', marginBottom: 'var(--space-1)' }}>
        {title}
      </p>
      <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900 }}>{value}</p>
    </motion.div>
  );
}
