"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { Play, Star, Radio, TrendingUp, Tv, ChevronRight, ChevronLeft } from "lucide-react";

/**
 * INES-TV — Netflix/DAZN Premium Homepage
 * Features: Hero, Horizontal Rows, Real-time Socket sync, Category filtering
 */

type ChannelItem = {
  id: string;
  name: string;
  category?: string;
  league?: string;
  score?: string;
  homeName?: string;
  awayName?: string;
  homeLogo?: string;
  awayLogo?: string;
  thumbnail?: string;
  streamUrl?: string;
  viewers?: string;
  status?: string;
  liveness?: string;
  pressureIndex?: number;
};

// ── DEMO DATA (fallback when API is unavailable) ──
const DEMO_CHANNELS: ChannelItem[] = [
  { id: "1", name: "Real Madrid vs Barcelona", category: "Football", league: "La Liga", score: "2-1", homeName: "Real Madrid", awayName: "Barcelona", viewers: "45.2K", status: "LIVE", liveness: "HOT", pressureIndex: 0.91 },
  { id: "2", name: "Liverpool vs Man City", category: "Football", league: "Premier League", score: "0-0", homeName: "Liverpool", awayName: "Man City", viewers: "38.1K", status: "LIVE", liveness: "HOT", pressureIndex: 0.78 },
  { id: "3", name: "Lakers vs Celtics", category: "Basketball", league: "NBA", score: "102-98", homeName: "Lakers", awayName: "Celtics", viewers: "22.5K", status: "LIVE", liveness: "HOT", pressureIndex: 0.85 },
  { id: "4", name: "PSG vs Bayern Munich", category: "Football", league: "Champions League", score: "1-1", homeName: "PSG", awayName: "Bayern", viewers: "51.3K", status: "LIVE", liveness: "HOT", pressureIndex: 0.88 },
  { id: "5", name: "Djokovic vs Alcaraz", category: "Tennis", league: "Roland Garros", score: "6-4 3-2", homeName: "Djokovic", awayName: "Alcaraz", viewers: "12.8K", status: "LIVE", liveness: "WARM", pressureIndex: 0.65 },
  { id: "6", name: "Man United vs Arsenal", category: "Football", league: "Premier League", score: "1-2", homeName: "Man United", awayName: "Arsenal", viewers: "34.7K", status: "LIVE", liveness: "HOT", pressureIndex: 0.82 },
  { id: "7", name: "Warriors vs Bucks", category: "Basketball", league: "NBA", score: "88-91", homeName: "Warriors", awayName: "Bucks", viewers: "18.2K", status: "LIVE", liveness: "WARM", pressureIndex: 0.6 },
  { id: "8", name: "Inter vs AC Milan", category: "Football", league: "Serie A", score: "0-1", homeName: "Inter", awayName: "AC Milan", viewers: "28.9K", status: "LIVE", liveness: "HOT", pressureIndex: 0.75 },
];

export default function HomePage() {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/feed/home");
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const mapped = data.items
            .filter((i: any) => i.type === "match" || i.type === "featured")
            .map((i: any) => ({ ...i.data, id: i.id || i.data?.id }));
          setChannels(mapped.length > 0 ? mapped : DEMO_CHANNELS);
        } else {
          setChannels(DEMO_CHANNELS);
        }
      } catch {
        setChannels(DEMO_CHANNELS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const socket = io({ transports: ["websocket"] });
    socket.on("feed:update", (u: any) => {
      if (u.items) {
        const mapped = u.items
          .filter((i: any) => i.type === "match" || i.type === "featured")
          .map((i: any) => ({ ...i.data, id: i.id || i.data?.id }));
        if (mapped.length > 0) setChannels(mapped);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const categories = ["All", ...Array.from(new Set(channels.map(c => c.category).filter(Boolean)))];
  const featured = channels[0];
  const filtered = activeCategory === "All" ? channels : channels.filter(c => c.category === activeCategory);

  const groupByCategory = (cat: string) => channels.filter(c => c.category === cat);
  const uniqueCategories = Array.from(new Set(channels.map(c => c.category).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-red-600/30">
                <Tv size={18} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              INES<span className="text-red-500">TV</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Live", "Football", "Basketball", "Tennis"].map(cat => (
              <button key={cat} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">{cat}</button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live</span>
            </div>
            <Link href="/login" className="text-xs font-bold text-zinc-400 hover:text-white transition">Login</Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      {!isLoading && featured && (
        <section className="relative w-full h-[85vh] min-h-[600px]">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_60%)]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 md:px-16 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {/* Badges */}
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-600/30">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Live Now
                </span>
                <span className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  {featured.league || featured.category}
                </span>
                {(featured.pressureIndex || 0) > 0.8 && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <TrendingUp size={10} /> Trending
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-3 max-w-3xl">
                {featured.homeName && featured.awayName
                  ? <>{featured.homeName} <span className="text-zinc-600">vs</span> {featured.awayName}</>
                  : featured.name
                }
              </h1>

              {/* Score */}
              {featured.score && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">{featured.score}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Score</span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-6 mb-8 text-sm text-zinc-400">
                {featured.viewers && (
                  <span className="flex items-center gap-2"><Radio size={14} className="text-red-500" /> {featured.viewers} watching</span>
                )}
                <span className="flex items-center gap-2"><Star size={14} className="text-amber-500" /> Premium Quality</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4">
                <Link href={`/watch/${featured.id}`}
                  className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 text-sm uppercase tracking-wider"
                >
                  <Play size={18} fill="white" /> Watch Now
                </Link>
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-bold px-6 py-4 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95 text-sm">
                  <Star size={16} /> Add to Favorites
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030303] to-transparent" />
        </section>
      )}

      {/* ═══ LOADING SKELETON ═══ */}
      {isLoading && (
        <div className="h-[85vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Loading Stream Engine</span>
          </div>
        </div>
      )}

      {/* ═══ CATEGORY PILLS ═══ */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ HORIZONTAL ROWS BY CATEGORY ═══ */}
      {activeCategory === "All" ? (
        uniqueCategories.map(cat => {
          const items = groupByCategory(cat);
          if (items.length === 0) return null;
          return <ChannelRow key={cat} title={cat} items={items} />;
        })
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(ch => <MatchCard key={ch.id} match={ch} />)}
          </div>
        </div>
      )}

      {/* ═══ ALL LIVE MATCHES ═══ */}
      {activeCategory === "All" && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 pb-10">
          <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-red-600 rounded-full" />
            All Live Matches
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {channels.slice(1).map(ch => <MatchCard key={ch.id} match={ch} />)}
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="max-w-7xl mx-auto px-6 md:px-16 py-16 border-t border-white/5 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><Tv size={14} /></div>
            <span className="font-black tracking-tight">INES<span className="text-red-500">TV</span></span>
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
            Premium Live Streaming Platform • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   📺 HORIZONTAL ROW (Netflix-style)
   ═══════════════════════════════════════════════ */
function ChannelRow({ title, items }: { title: string; items: ChannelItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-16 mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full" />
          {title}
          <span className="text-zinc-600 text-sm font-bold ml-1">{items.length}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2">
        {items.map(ch => (
          <div key={ch.id} className="min-w-[300px] max-w-[300px] flex-shrink-0">
            <MatchCard match={ch} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   🏟️ MATCH CARD (Premium Design)
   ═══════════════════════════════════════════════ */
function MatchCard({ match }: { match: ChannelItem }) {
  const p = match.pressureIndex || 0;
  const isHot = match.liveness === "HOT";

  return (
    <Link href={`/watch/${match.id}`}>
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative bg-[#0A0A0A] border rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500
          ${isHot ? "border-red-500/20 shadow-lg shadow-red-500/5" : "border-white/5 hover:border-white/15"}
        `}
      >
        {/* Top gradient bar */}
        <div className={`h-1 w-full ${isHot ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-600" : "bg-gradient-to-r from-zinc-800 to-zinc-700"}`} />

        <div className="p-5">
          {/* Header: League + Live Badge */}
          <div className="flex justify-between items-center mb-5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 bg-white/5 px-2.5 py-1 rounded-lg">
              {match.league || match.category}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isHot ? "bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" : "bg-zinc-600"}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isHot ? "text-red-400" : "text-zinc-600"}`}>
                {isHot ? "Live" : "Warmup"}
              </span>
            </div>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between text-center mb-5">
            <div className="flex-1">
              <div className="w-12 h-12 mx-auto bg-white/5 rounded-2xl mb-2 flex items-center justify-center font-black text-lg text-zinc-600 group-hover:bg-white/10 transition">
                {match.homeName?.charAt(0) || "H"}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-300 truncate px-1">{match.homeName}</div>
            </div>

            <div className="px-3">
              <div className="text-3xl font-black tracking-tighter text-white tabular-nums">{match.score || "—"}</div>
              {p > 0 && (
                <div className="mt-1 h-0.5 bg-white/5 rounded-full overflow-hidden w-16 mx-auto">
                  <div className={`h-full ${p > 0.8 ? "bg-red-500" : "bg-zinc-600"}`} style={{ width: `${p * 100}%` }} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="w-12 h-12 mx-auto bg-white/5 rounded-2xl mb-2 flex items-center justify-center font-black text-lg text-zinc-600 group-hover:bg-white/10 transition">
                {match.awayName?.charAt(0) || "A"}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-300 truncate px-1">{match.awayName}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-zinc-500">
              <Radio size={12} />
              <span className="text-[10px] font-bold">{match.viewers || "—"}</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-red-500 group-hover:text-red-400 transition flex items-center gap-1">
              Watch <ChevronRight size={10} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
