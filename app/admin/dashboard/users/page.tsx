'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Crown, UserCheck, RefreshCw, ChevronDown, Ban, CheckCircle } from 'lucide-react';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.slice(0, 2) + '***';
  return `${masked}@${domain}`;
}

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  USER: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};
const roleIcon: Record<string, React.ReactNode> = {
  ADMIN: <Shield size={11} />,
  PREMIUM: <Crown size={11} />,
  USER: <UserCheck size={11} />,
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'PREMIUM' | 'ADMIN'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showToast(`Rôle mis à jour → ${newRole}`);
      } else {
        showToast('Erreur lors de la mise à jour', false);
      }
    } catch {
      showToast('Erreur réseau', false);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = maskEmail(u.email).includes(search) || u.name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl font-bold text-sm transition-all ${
          toast.ok ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' : 'bg-red-950 border-red-500/30 text-red-400'
        }`}>
          {toast.ok ? <CheckCircle size={16} /> : <Ban size={16} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-400" size={24} />
            Gestion des Utilisateurs
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{users.length} comptes enregistrés</p>
        </div>
        <button onClick={fetchUsers} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'USER', 'PREMIUM', 'ADMIN'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                roleFilter === r
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Utilisateur</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rôle</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inscrit le</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-white/5 rounded-full animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-600 text-sm font-bold">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-sm font-black text-white">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-white">{user.name || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-400 font-mono">{maskEmail(user.email)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${roleBadge[user.role] || roleBadge.USER}`}>
                    {roleIcon[user.role]}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {updatingId === user.id ? (
                      <RefreshCw size={14} className="animate-spin text-zinc-400" />
                    ) : (
                      <div className="relative group">
                        <select
                          defaultValue={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          className="appearance-none bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-bold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-blue-500/50 cursor-pointer hover:border-white/20 transition-all"
                        >
                          <option value="USER">USER</option>
                          <option value="PREMIUM">PREMIUM</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats footer */}
      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
        <span className="text-zinc-600">Total: <span className="text-white">{users.length}</span></span>
        <span className="text-zinc-600">Premium: <span className="text-purple-400">{users.filter(u => u.role === 'PREMIUM').length}</span></span>
        <span className="text-zinc-600">Admin: <span className="text-emerald-400">{users.filter(u => u.role === 'ADMIN').length}</span></span>
        <span className="text-zinc-600">Free: <span className="text-zinc-400">{users.filter(u => u.role === 'USER').length}</span></span>
      </div>
    </div>
  );
}
