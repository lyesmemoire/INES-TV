"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const fallbackMatches = [
  { t: "PSG vs OM", s: "1 - 0" },
  { t: "UFC Fight Night", s: "Round 3" },
  { t: "Lakers vs Heat", s: "89 - 84" },
];

export default function LiveNow() {
  const [matches, setMatches] = useState(fallbackMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveCategories() {
      try {
        const res = await fetch("https://sportapi7.p.rapidapi.com/api/v1/sport/football/live-categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "sportapi7.p.rapidapi.com",
            "x-rapidapi-key": "c8938a9878msha50532632af02dbp147fbbjsn6a076ebafee6",
          },
        });

        const data = await res.json();
        
        // Log the data format to adapt it since we don't know the exact schema
        console.log("RapidAPI Data:", data);

        if (data && data.message) {
          // e.g. "You are not subscribed to this API."
          setError(data.message);
        } else if (data && data.liveCategories) {
          // The API returns an object like {"31": 1, "46": 3} where keys are category IDs and values are live match counts.
          const categories = Object.entries(data.liveCategories);
          const formatted = categories.slice(0, 3).map(([id, count]) => ({
            t: `League #${id}`,
            s: `${count} Live Match${Number(count) > 1 ? 'es' : ''}`,
          }));
          if (formatted.length > 0) setMatches(formatted);
        } else if (Array.isArray(data)) {
          // Fallback parsing just in case
          const formatted = data.slice(0, 3).map((item: any) => ({
            t: item.name || item.title || "Live Match",
            s: item.status || "LIVE",
          }));
          if (formatted.length > 0) setMatches(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch from RapidAPI", err);
        setError("Failed to load live API.");
      } finally {
        setLoading(false);
      }
    }

    fetchLiveCategories();
  }, []);

  return (
    <section className="px-6 py-20">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold">Live Now</h2>
        {error && <span className="text-red-500/60 text-sm">({error} - Using fallback)</span>}
        {loading && <span className="text-white/40 text-sm">Loading live feed...</span>}
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6"
      >
        {matches.map((m, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 40 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.04 }}
            className="bg-white/5 border border-white/10 p-6 rounded-xl cursor-pointer relative overflow-hidden"
          >
            {/* Soft glow for live items */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <p className="text-red-500 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </p>
            <h3 className="text-lg font-semibold mt-2">{m.t}</h3>
            <p className="text-white/60 mt-1">{m.s}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
