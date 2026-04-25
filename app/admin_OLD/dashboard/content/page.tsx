'use client';

import React, { useEffect, useState } from 'react';
import { Tv, RefreshCw, Edit2, Check, X, Search, Radio, Power } from 'lucide-react';

export default function ContentPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/channels', { credentials: 'include' });
      if (res.ok) setChannels(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchChannels(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync/channels', { method: 'POST', credentials: 'include' });
      if (res.ok) { showToast('Sync M3U terminé ✓'); fetchChannels(); }
      else showToast('Erreur lors du sync', false);
    } catch { showToast('Erreur réseau', false); }
    finally { setSyncing(false); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      if (res.ok) { showToast('Chaîne mise à jour ✓'); setEditingId(null); fetchChannels(); }
      else showToast('Erreur mise à jour', false);
    } catch { showToast('Erreur réseau', false); }
  };

  const filtered = channels.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl font-bold text-sm ${
          toast.ok ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' : 'bg-red-950 border-red-500/30 text-red-400'
        }`}>
          {toast.ok ? <Check size={16} /> : <X size={16} />} {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Tv className="text-rose-400" size={24} />
            Gestion du Contenu
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{channels.length} chaînes en base</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchChannels} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sync en cours...' : 'Sync M3U'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Rechercher une chaîne..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest w-10">Live</th>
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Chaîne</th>
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score</th>
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Statut</th>
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Catégorie</th>
              <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3">
                  <div className="h-4 bg-white/5 rounded-full animate-pulse" />
                </td></tr>
              ))
            ) : filtered.map(ch => (
              <tr key={ch.id} className="hover:bg-white/[0.02] transition-colors">
                {/* Live indicator */}
                <td className="px-4 py-3 text-center">
                  <div className={`w-2.5 h-2.5 rounded-full mx-auto ${ch.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-zinc-700'}`} />
                </td>
                {/* Channel name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {ch.thumbnail && <img src={ch.thumbnail} className="w-8 h-8 rounded-lg object-cover bg-zinc-800" alt="" />}
                    {editingId === ch.id ? (
                      <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="bg-black border border-white/20 rounded-lg px-2 py-1 text-white text-sm w-full" />
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-white">{ch.name}</p>
                        <p className="text-[9px] text-zinc-600 font-mono truncate max-w-[160px]">{ch.streamUrl}</p>
                      </div>
                    )}
                  </div>
                </td>
                {/* Score */}
                <td className="px-4 py-3">
                  {editingId === ch.id ? (
                    <input value={editForm.score || ''} placeholder="2-1" onChange={e => setEditForm({...editForm, score: e.target.value})}
                      className="bg-black border border-white/20 rounded px-2 py-1 text-emerald-400 font-mono text-sm w-20" />
                  ) : (
                    <span className="text-sm font-black text-emerald-400 font-mono">{ch.score || 'VS'}</span>
                  )}
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  {editingId === ch.id ? (
                    <select value={editForm.status || 'UPCOMING'} onChange={e => setEditForm({...editForm, status: e.target.value})}
                      className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white">
                      <option value="LIVE">LIVE</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      ch.status === 'LIVE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      ch.status === 'FINISHED' ? 'bg-zinc-800 text-zinc-500 border-zinc-700' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {ch.status || 'UPCOMING'}
                    </span>
                  )}
                </td>
                {/* Category */}
                <td className="px-4 py-3">
                  {editingId === ch.id ? (
                    <input value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})}
                      className="bg-black border border-white/20 rounded px-2 py-1 text-white text-sm w-28" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-zinc-500 uppercase">
                      {ch.category}
                    </span>
                  )}
                </td>
                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  {editingId === ch.id ? (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => handleUpdate(ch.id)} className="p-1.5 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(ch.id); setEditForm(ch); }}
                      className="p-1.5 bg-white/5 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all">
                      <Edit2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="p-16 text-center">
            <Radio size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-600 font-bold text-sm">Aucune chaîne — lancez un Sync M3U</p>
          </div>
        )}
      </div>
    </div>
  );
}
