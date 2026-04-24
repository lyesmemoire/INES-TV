'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, RefreshCw, Check, X, Clock, Shield, Bell } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
  description: string;
  type: 'number' | 'text' | 'boolean';
  unit?: string;
}

const SETTING_META: Record<string, { label: string; description: string; type: 'number' | 'text' | 'boolean'; unit?: string }> = {
  ad_frequency_seconds: {
    label: 'Fréquence des publicités',
    description: 'Intervalle entre chaque affichage publicitaire (en secondes)',
    type: 'number',
    unit: 'secondes',
  },
  platform_name: {
    label: 'Nom de la plateforme',
    description: 'Nom affiché dans l\'interface publique',
    type: 'text',
  },
  maintenance_mode: {
    label: 'Mode maintenance',
    description: 'Active la page de maintenance pour les visiteurs',
    type: 'boolean',
  },
  max_streams_free: {
    label: 'Streams max (Free)',
    description: 'Nombre maximum de streams simultanés pour les utilisateurs gratuits',
    type: 'number',
    unit: 'streams',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const enriched: Setting[] = data.map((s: any) => ({
          ...s,
          ...(SETTING_META[s.key] || {
            label: s.key,
            description: 'Paramètre système',
            type: 'text',
          }),
        }));
        setSettings(enriched);
        const initial: Record<string, string> = {};
        enriched.forEach(s => { initial[s.key] = s.value; });
        setEdits(initial);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, value: edits[key] }),
      });
      if (res.ok) showToast(`"${key}" mis à jour ✓`);
      else showToast('Erreur lors de la sauvegarde', false);
    } catch { showToast('Erreur réseau', false); }
    finally { setSaving(null); }
  };

  const hasChanged = (key: string, original: string) => edits[key] !== original;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl font-bold text-sm ${
          toast.ok ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' : 'bg-red-950 border-red-500/30 text-red-400'
        }`}>
          {toast.ok ? <Check size={16} /> : <X size={16} />} {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-zinc-400" size={24} />
            Paramètres Globaux
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Configuration de la plateforme</p>
        </div>
        <button onClick={fetchSettings} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4">
        <Shield size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs font-bold text-amber-400/80">
          Ces paramètres affectent l'ensemble de la plateforme en temps réel. Modifiez-les avec précaution.
        </p>
      </div>

      {/* Settings list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <div className="h-4 bg-white/5 rounded-full animate-pulse mb-2 w-1/3" />
              <div className="h-3 bg-white/5 rounded-full animate-pulse w-2/3" />
            </div>
          ))
        ) : settings.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
            <Settings size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-600 font-bold text-sm">Aucun paramètre configuré</p>
            <p className="text-zinc-700 text-xs mt-1">Les paramètres sont créés automatiquement au démarrage</p>
          </div>
        ) : settings.map(setting => (
          <div key={setting.key} className="bg-zinc-900/50 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-black text-white">{setting.label}</h3>
                  <span className="text-[9px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {setting.key}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">{setting.description}</p>

                {setting.type === 'boolean' ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newVal = edits[setting.key] === 'true' ? 'false' : 'true';
                        setEdits(prev => ({ ...prev, [setting.key]: newVal }));
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${edits[setting.key] === 'true' ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${edits[setting.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm font-bold text-zinc-300">
                      {edits[setting.key] === 'true' ? 'Activé' : 'Désactivé'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type={setting.type === 'number' ? 'number' : 'text'}
                      value={edits[setting.key] ?? setting.value}
                      onChange={e => setEdits(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-all font-mono w-48"
                    />
                    {setting.unit && <span className="text-xs text-zinc-500 font-bold">{setting.unit}</span>}
                    {setting.key === 'ad_frequency_seconds' && (
                      <span className="text-xs text-zinc-600">
                        = {Math.floor(Number(edits[setting.key]) / 60)} min
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Save button */}
              <button
                onClick={() => handleSave(setting.key)}
                disabled={saving === setting.key || !hasChanged(setting.key, setting.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                  hasChanged(setting.key, setting.value)
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                {saving === setting.key
                  ? <RefreshCw size={14} className="animate-spin" />
                  : hasChanged(setting.key, setting.value)
                    ? <Save size={14} />
                    : <Check size={14} />
                }
                {saving === setting.key ? 'Saving...' : hasChanged(setting.key, setting.value) ? 'Sauvegarder' : 'Sauvegardé'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
