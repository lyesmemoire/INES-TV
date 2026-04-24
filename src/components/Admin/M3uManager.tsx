'use client';

import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Check, 
  AlertCircle, 
  Link as LinkIcon, 
  Activity,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface M3uSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

export default function M3uManager() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [sources, setSources] = useState<M3uSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New source form
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/m3u');
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (e) {
      setError('Impossible de charger les sources M3U');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/m3u', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, url: newUrl })
      });
      if (res.ok) {
        setNewName('');
        setNewUrl('');
        setIsAdding(false);
        fetchSources();
      } else {
        const err = await res.json();
        setError(err.error || 'Erreur lors de l’ajout');
      }
    } catch (e) {
      setError('Erreur réseau lors de l’ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('📧 Supprimer définitivement cette source ?')) return;
    try {
      const res = await fetch(`/api/m3u/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchSources();
    } catch (e) {
      setError('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (source: M3uSource) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/m3u/${source.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !source.isActive })
      });
      if (res.ok) fetchSources();
    } catch (e) {
      setError('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase">
            <Globe className="text-emerald-500" size={32} />
            M3U Infrastructure
          </h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            Distribution & Playlist Provisioning Engine
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Optimal</span>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Source
          </button>
        </div>
      </div>

      {/* Grid Monitor (Micro Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Sources', value: sources.length, icon: Smartphone, color: 'text-blue-400' },
          { label: 'Active Streams', value: sources.filter(s => s.isActive).length, icon: Activity, color: 'text-emerald-400' },
          { label: 'Security Level', value: 'High', icon: ShieldCheck, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-colors" />
            <div className="flex items-center justify-between mb-4">
               <stat.icon size={20} className="text-zinc-500" />
               <span className={`text-xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* error */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm"
          >
            <AlertCircle size={18} /> {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-white">Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {sources.map((source) => (
            <motion.div
              layout
              key={source.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-zinc-900/30 hover:bg-zinc-800/40 border border-white/5 hover:border-emerald-500/30 p-6 rounded-3xl transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${source.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    <LinkIcon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-white tracking-tight uppercase italic">{source.name}</h3>
                      {source.isActive ? (
                        <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="text-[9px] font-black bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">Offline</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-1 opacity-60 truncate max-w-md">{source.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleStatus(source)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      source.isActive 
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                        : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                    }`}
                  >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    {source.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => handleDelete(source.id)}
                    className="p-3 bg-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sources.length === 0 && !loading && (
          <div className="py-24 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6">
              <Globe size={32} className="text-zinc-700" />
            </div>
            <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest italic">Zero Infrastructure Nodes</h3>
            <p className="text-zinc-600 text-xs mt-2">Connect your first M3U source to begin provisioning.</p>
          </div>
        )}
      </div>

      {/* Add Modal (Overlay) */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0B0F19] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">New Stream Feed</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">Register high-performance M3U endpoint</p>

              <form onSubmit={handleAdd} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Provider Name</label>
                    <input 
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g., GLOBAL PREMIUM IPTV"
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-zinc-700 outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">M3U Playlist Endpoint</label>
                    <input 
                      required
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-zinc-700 outline-none focus:border-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-500 hover:text-white transition-colors border border-white/5 hover:bg-white/5"
                  >
                    Rollback
                  </button>
                  <button 
                    type="submit" 
                    className="py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Deploy Source
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
