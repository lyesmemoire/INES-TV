'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard, RefreshCw, CheckCircle, XCircle, Clock,
  TrendingUp, Users, DollarSign
} from 'lucide-react';

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  EXPIRED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const statusIcon: Record<string, React.ReactNode> = {
  ACTIVE: <CheckCircle size={11} />,
  CANCELLED: <XCircle size={11} />,
  EXPIRED: <Clock size={11} />,
  PENDING: <Clock size={11} />,
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'>('ALL');

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', { credentials: 'include' });
      if (res.ok) setSubs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const filtered = filter === 'ALL' ? subs : subs.filter(s => s.status === filter);
  const active = subs.filter(s => s.status === 'ACTIVE');
  const mrr = active.length * 9.99; // mock pricing

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="text-purple-400" size={24} />
            Abonnements
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{subs.length} abonnements au total</p>
        </div>
        <button onClick={fetchSubs} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Actifs', value: active.length, icon: <Users size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'MRR Estimé', value: `$${mrr.toFixed(2)}`, icon: <DollarSign size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Taux de Conversion', value: `${subs.length > 0 ? ((active.length / subs.length) * 100).toFixed(1) : 0}%`, icon: <TrendingUp size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(c => (
          <div key={c.label} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl border ${c.bg}`}>
              <span className={c.color}>{c.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{c.label}</p>
              <p className="text-xl font-black text-white">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'CANCELLED', 'EXPIRED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === f
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Utilisateur</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Plan</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Statut</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Créé le</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mis à jour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4">
                  <div className="h-4 bg-white/5 rounded-full animate-pulse" />
                </td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-zinc-600 text-sm font-bold">Aucun abonnement trouvé</td></tr>
            ) : filtered.map(sub => (
              <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-xs font-black text-white">
                      {(sub.user?.name || sub.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{sub.user?.name || '—'}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {sub.user?.email ? sub.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                    {sub.planId || 'PREMIUM_MONTHLY'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${statusStyle[sub.status] || statusStyle.EXPIRED}`}>
                    {statusIcon[sub.status]}
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500">
                  {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500">
                  {new Date(sub.updatedAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
