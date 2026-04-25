// app/admin/matches/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Radio } from "lucide-react";

export default function MatchesListPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/admin/matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error("Failed to load matches:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Gestion des matchs</h1>
          <p className="text-zinc-500">
            {matches.length} match{matches.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/admin/matches/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Nouveau match
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-zinc-500 mb-4">Aucun match créé pour le moment</p>
          <Link
            href="/admin/matches/new"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all"
          >
            <Plus size={20} />
            Créer le premier match
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {match.status === "LIVE" && (
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
                      <Radio size={14} className="animate-pulse" />
                      <span className="text-xs font-black uppercase">LIVE</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{match.title}</h3>
                    <p className="text-sm text-zinc-500">
                      {match.category} • {match.viewers || 0} viewers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/matches/${match.id}/edit`}
                    className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-all"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce match ?")) {
                        // TODO: API delete
                      }
                    }}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
