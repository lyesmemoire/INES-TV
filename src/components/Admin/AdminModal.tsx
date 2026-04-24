import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import AdminAdsDashboard from './AdminAdsDashboard';
import AdminRevenueDashboard from './AdminRevenueDashboard';
import { Database, X, RefreshCw, CheckCircle2, Loader2, Edit2, Check, Activity, CreditCard } from 'lucide-react';

interface M3uSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastFetched: string | null;
}

interface AdminStats {
  channels: number;
  programs: number;
  users: number;
}

export default function AdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [sources, setSources] = useState<M3uSource[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'channels' | 'ads' | 'saas'>('stats');
  
  // Channels management state
  const [channels, setChannels] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/m3u/sources');
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'ok') setSources(data.sources);
    } catch (e) {}
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === 'ok') setStats(data.counts);
    } catch (e) {}
  };

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/channels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setChannels(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchSources();
      fetchStats();
      fetchChannels();
    }
  }, [isOpen]);

  const handleUpdateChannel = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/channels/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      fetchChannels();
    } catch (e) {}
  };

  const handleSyncChannels = async () => {
    setSyncing('channels');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/sync/channels', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      await fetchStats();
      await fetchChannels();
    } finally {
      setSyncing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="text-black" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Admin Dashboard</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">StreamPerf Ecosystem Control</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900/30 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-white/5' : 'text-zinc-500 hover:text-white'}`}
          >
            Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab('channels')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'channels' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-white/5' : 'text-zinc-500 hover:text-white'}`}
          >
            Gestion des Chaînes
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ads' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-zinc-500 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <Activity size={14} />
              Publicité
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('saas')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'saas' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-white/5' : 'text-zinc-500 hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <CreditCard size={14} />
              Finance
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {activeTab === 'stats' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Chaînes Live', value: stats?.channels ?? '...', icon: '📺' },
                  { label: 'Programmes EPG', value: stats?.programs ?? '...', icon: '📅' },
                  { label: 'Utilisateurs', value: stats?.users ?? '...', icon: '👥' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-2xl font-black text-white">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sources Management */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <RefreshCw size={14} className="text-emerald-500" />
                    Sources M3U
                  </h3>
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-zinc-500 text-xs italic">
                    Gestion des sources groupées via .m3u
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Sync Totale
                  </h3>
                  <button 
                    onClick={handleSyncChannels}
                    disabled={!!syncing}
                    className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {syncing === 'channels' ? <Loader2 size={18} className="animate-spin text-emerald-500" /> : <RefreshCw size={18} className="text-emerald-400" />}
                      <div className="text-left">
                        <p className="text-sm font-black text-white">Full M3U Sync</p>
                        <p className="text-[10px] text-zinc-500">Mettre à jour tous les liens et noms</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'ads' ? (
            <AdminAdsDashboard />
          ) : activeTab === 'saas' ? (
            <AdminRevenueDashboard />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Matchs & Scores en Direct
                </h3>
              </div>
              
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Canal / Match</th>
                      <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Score / Temps</th>
                      <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Statut</th>
                      <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {channels.map(ch => (
                      <tr key={ch.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {ch.thumbnail && <img src={ch.thumbnail} className="w-8 h-8 rounded-lg object-cover bg-zinc-800" alt="" />}
                            <div className="min-w-0">
                              {editingId === ch.id ? (
                                <input 
                                  value={editForm.name} 
                                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                                  className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white w-full"
                                />
                              ) : (
                                <p className="text-sm font-bold text-white truncate">{ch.name}</p>
                              )}
                              <p className="text-[9px] text-zinc-600 font-mono truncate max-w-[150px]">{ch.streamUrl}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {editingId === ch.id ? (
                            <div className="flex flex-col gap-1">
                              <input 
                                value={editForm.score || ''} 
                                onChange={e => setEditForm({...editForm, score: e.target.value})}
                                placeholder="Score (ex: 2-1)"
                                className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                              />
                              <input 
                                value={editForm.matchTime || ''} 
                                onChange={e => setEditForm({...editForm, matchTime: e.target.value})}
                                placeholder="Temps (ex: 75')"
                                className="bg-black border border-white/20 rounded px-2 py-1 text-[10px] text-zinc-400"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-emerald-400 font-mono">{ch.score || 'VS'}</span>
                              <span className="text-[10px] text-zinc-500">{ch.matchTime || '--'}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {editingId === ch.id ? (
                            <select 
                              value={editForm.status || 'UPCOMING'}
                              onChange={e => setEditForm({...editForm, status: e.target.value})}
                              className="bg-black border border-white/20 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="LIVE">LIVE</option>
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="FINISHED">FINISHED</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              ch.status === 'LIVE' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-zinc-500 border border-white/5'
                            }`}>
                              {ch.status || 'UPCOMING'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {editingId === ch.id ? (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleUpdateChannel(ch.id)} className="p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400"><Check size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20"><X size={16} /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => { setEditingId(ch.id); setEditForm(ch); }}
                                className="p-2 bg-white/5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-zinc-900/30 flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
           <div>StreamPerf Admin v3.0</div>
           <div className="flex gap-4">
              <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Real-time Sync Active</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
