"use client";

import { useState } from "react";
import { Plus, Trash2, TestTube, Upload } from "lucide-react";

interface StreamSource {
  id: string;
  type: "facebook" | "m3u8" | "youtube" | "mp4" | "rtmp" | "direct";
  url: string;
  priority: number;
  status: "untested" | "valid" | "invalid";
}

export default function MatchForm() {
  const [formData, setFormData] = useState({
    title: "",
    category: "football",
    homeTeam: "",
    awayTeam: "",
    homeLogo: "",
    awayLogo: "",
    score: "",
    scheduledAt: "",
    isPremium: false,
    thumbnail: "",
  });

  const [sources, setSources] = useState<StreamSource[]>([
    {
      id: "1",
      type: "facebook",
      url: "",
      priority: 1,
      status: "untested",
    },
  ]);

  const addSource = () => {
    setSources([
      ...sources,
      {
        id: Date.now().toString(),
        type: "m3u8",
        url: "",
        priority: sources.length + 1,
        status: "untested",
      },
    ]);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const testSource = async (id: string) => {
    const source = sources.find((s) => s.id === id);
    if (!source) return;

    try {
      const response = await fetch("/api/admin/streams/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url, type: source.type }),
      });

      const result = await response.json();

      setSources(
        sources.map((s) =>
          s.id === id ? { ...s, status: result.valid ? "valid" : "invalid" } : s
        )
      );
    } catch (error) {
      setSources(
        sources.map((s) => (s.id === id ? { ...s, status: "invalid" } : s))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchData = {
      ...formData,
      sources: sources.filter((s) => s.url),
    };

    try {
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        alert("Match créé avec succès !");
        window.location.href = "/admin/matches";
      }
    } catch (error) {
      alert("Erreur lors de la création");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {/* INFORMATIONS DU MATCH */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-black mb-6">📋 Informations du match</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Titre du match</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              placeholder="PSG vs OM"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
            >
              <option value="football">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
              <option value="tennis">🎾 Tennis</option>
              <option value="rugby">🏉 Rugby</option>
              <option value="boxing">🥊 Boxe</option>
              <option value="mma">🥋 MMA</option>
              <option value="news">📰 News</option>
              <option value="sports">🏆 Sports</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Équipe domicile</label>
            <input
              type="text"
              value={formData.homeTeam}
              onChange={(e) =>
                setFormData({ ...formData, homeTeam: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
              placeholder="Paris Saint-Germain"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Équipe extérieur</label>
            <input
              type="text"
              value={formData.awayTeam}
              onChange={(e) =>
                setFormData({ ...formData, awayTeam: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
              placeholder="Olympique de Marseille"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo domicile (URL)</label>
            <input
              type="url"
              value={formData.homeLogo}
              onChange={(e) =>
                setFormData({ ...formData, homeLogo: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Logo extérieur (URL)</label>
            <input
              type="url"
              value={formData.awayLogo}
              onChange={(e) =>
                setFormData({ ...formData, awayLogo: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Date et heure</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({ ...formData, scheduledAt: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Score (optionnel)</label>
            <input
              type="text"
              value={formData.score}
              onChange={(e) =>
                setFormData({ ...formData, score: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3"
              placeholder="2-1"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPremium}
              onChange={(e) =>
                setFormData({ ...formData, isPremium: e.target.checked })
              }
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <span className="text-sm font-bold">💎 Match Premium</span>
          </label>
        </div>
      </section>

      {/* SOURCES DE STREAMING */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">📡 Sources de streaming</h2>
          <button
            type="button"
            onClick={addSource}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg transition-all"
          >
            <Plus size={18} />
            Ajouter une source
          </button>
        </div>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <div
              key={source.id}
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-zinc-400">
                  Source #{index + 1} (Priorité: {source.priority})
                </span>
                <div className="flex items-center gap-2">
                  {source.status === "valid" && (
                    <span className="text-xs font-bold text-emerald-500">
                      ✓ Valide
                    </span>
                  )}
                  {source.status === "invalid" && (
                    <span className="text-xs font-bold text-red-500">✗ Invalide</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSource(source.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2">Type</label>
                  <select
                    value={source.type}
                    onChange={(e) =>
                      setSources(
                        sources.map((s) =>
                          s.id === source.id
                            ? { ...s, type: e.target.value as any }
                            : s
                        )
                      )
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="facebook">Facebook Live</option>
                    <option value="m3u8">M3U8/HLS</option>
                    <option value="youtube">YouTube Live</option>
                    <option value="mp4">MP4 Direct</option>
                    <option value="rtmp">RTMP</option>
                    <option value="direct">Lien direct</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-2">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={source.url}
                      onChange={(e) =>
                        setSources(
                          sources.map((s) =>
                            s.id === source.id ? { ...s, url: e.target.value } : s
                          )
                        )
                      }
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => testSource(source.id)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <TestTube size={16} />
                      Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBMIT */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          💾 Enregistrer et publier
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-4 rounded-xl transition-all"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
