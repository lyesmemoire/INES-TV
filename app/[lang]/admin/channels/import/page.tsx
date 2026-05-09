"use client";

import { useState } from "react";
import { parseM3U, IPTVChannel } from "@/src/lib/iptv/parseM3U";
import SafeClient from "@/components/SafeClient";

export default function ImportPage() {
  const [url, setUrl] = useState("https://t.freetv.fun/m3u/kids_original.m3u");
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clearExisting, setClearExisting] = useState(false);

  const handleFetch = async () => {
    if (!url) return;
    setIsFetching(true);
    setError(null);
    setSuccess(null);
    setChannels([]);

    try {
      const res = await fetch("/api/streams/fetch-m3u", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch M3U");
      }

      const data = await res.json();
      const parsed = parseM3U(data.content);
      setChannels(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching the playlist.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleImport = async () => {
    if (channels.length === 0) return;
    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/streams/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels, clearExisting }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to import channels");
      }

      const data = await res.json();
      setSuccess(`Imported ${data.inserted} channels successfully!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while importing channels.");
    } finally {
      setIsImporting(false);
    }
  };

  // Group channels by category for a nice summary
  const groupedCategories = channels.reduce((acc, ch) => {
    const cat = ch.group || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeClient>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black mb-2 text-white">Importation M3U</h1>
          <p className="text-zinc-400">
            Importez des playlists M3U pour mettre à jour le catalogue de chaînes.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              URL de la playlist M3U
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u"
              />
              <button
                onClick={handleFetch}
                disabled={isFetching || !url}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isFetching ? "Analyse en cours..." : "Analyser l'URL"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-sm">
              {success}
            </div>
          )}

          {channels.length > 0 && (
            <div className="pt-6 border-t border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Résumé de l'analyse ({channels.length} chaînes)
                </h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearExisting}
                      onChange={(e) => setClearExisting(e.target.checked)}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-zinc-300">
                      Effacer les chaînes existantes avant l'import
                    </span>
                  </label>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? "Importation..." : "Importer dans la BD"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(groupedCategories).map(([category, count]) => (
                  <div key={category} className="bg-black border border-zinc-800 p-4 rounded-xl">
                    <div className="text-zinc-500 text-xs font-medium mb-1 uppercase tracking-wider">
                      {category}
                    </div>
                    <div className="text-2xl font-bold text-white">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SafeClient>
  );
}
