import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, RefreshCcw, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface M3uSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastFetched?: string;
}

export default function M3uSettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
      setError('Impossible de charger les sources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSources();
  }, [isOpen]);

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
      }
    } catch (e) {
      setError('Erreur lors de l’ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Supprimer cette source ?')) return;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Globe className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{t('settings.m3uTitle')}</h2>
              <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">M3U Playlist Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {sources.length === 0 && !loading && !isAdding && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3 opacity-20">📡</div>
              <p className="text-zinc-400 text-sm italic">Aucune source personnalisée configurée.</p>
              <p className="text-zinc-600 text-xs mt-1">Utilisation de la playlist par défaut.</p>
            </div>
          )}

          {sources.map(source => (
            <div key={source.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate">{source.name}</h3>
                    {source.isActive ? (
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">{t('settings.active')}</span>
                    ) : (
                      <span className="text-[10px] font-black bg-zinc-500/20 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-500/30 uppercase">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate font-mono">{source.url}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleStatus(source)}
                    className={`p-2 rounded-lg transition-colors ${source.isActive ? 'text-zinc-400 hover:text-zinc-200' : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(source.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {isAdding ? (
            <form onSubmit={handleAdd} className="p-5 bg-white/10 border border-emerald-500/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Nom du fournisseur</label>
                  <input 
                    autoFocus
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: My IPTV Premium"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">URL de la playlist (.m3u)</label>
                  <input 
                    required
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 transition-colors font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Check size={18} /> {t('settings.save')}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 text-zinc-400 hover:text-white font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-emerald-400 transition-all"
            >
              <Plus size={24} />
              <span className="text-xs font-black uppercase tracking-widest">{t('settings.addSource')}</span>
            </button>
          )}
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-white/5 text-[10px] text-zinc-500 flex justify-between items-center">
            <span>TIP: La playlist par défaut est utilisée si aucune source n'est active.</span>
            <span className="font-mono">{sources.length} sources</span>
        </div>
      </div>
    </div>
  );
}
