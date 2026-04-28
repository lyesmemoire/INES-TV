"use client";

import { Menu, Search, ChevronDown, Play, ChevronRight, Clock, Tv, Trophy, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const HIGHLIGHTS = [
  { title: "PSG vs Marseille — Le Classique", subtitle: "Ligue 1 • Highlights", img: "photo-1551280857-2b9bbe5240f5" },
  { title: "Real Madrid vs Atletico", subtitle: "LaLiga • Extended Highlights", img: "photo-1574629810360-7efbbe195018" },
  { title: "Man City vs Arsenal", subtitle: "Premier League • Goals", img: "photo-1508098682722-e99c43a406b2" },
  { title: "Bayern vs Dortmund — Der Klassiker", subtitle: "Bundesliga • Full Match", img: "photo-1431324155629-1a6deb1dec8d" },
  { title: "Inter vs Juventus — Derby d'Italia", subtitle: "Serie A • Best Moments", img: "photo-1522778119026-d647f0596c20" },
  { title: "Ajax vs Feyenoord — De Klassieker", subtitle: "Eredivisie • Highlights", img: "photo-1459865264687-595f7b2f1abb" },
];

const LEAGUES = [
  { name: "Ligue 1", color: "from-blue-600 to-blue-800", emoji: "🇫🇷" },
  { name: "Premier League", color: "from-purple-600 to-purple-800", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "LaLiga", color: "from-orange-500 to-red-600", emoji: "🇪🇸" },
  { name: "Bundesliga", color: "from-red-600 to-red-800", emoji: "🇩🇪" },
  { name: "Serie A", color: "from-green-600 to-green-800", emoji: "🇮🇹" },
  { name: "Champions League", color: "from-blue-500 to-indigo-700", emoji: "⭐" },
  { name: "Saudi Pro League", color: "from-emerald-500 to-emerald-700", emoji: "🇸🇦" },
  { name: "MLS", color: "from-sky-500 to-blue-700", emoji: "🇺🇸" },
];

export default function HomeClient() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/football')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.response?.live) {
          setMatches(data.response.live.slice(0, 10));
        }
      })
      .catch(err => console.error("Error fetching live matches", err))
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    "Ligue 1 McDonald's",
    "Bundesliga",
    "Serie A",
    "Saudi Pro League",
    "Jupiler Pro League",
    "NFL",
    "NBA",
    "PFL",
    "Women's Champions League"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="text-white/80 hover:text-white transition flex items-center justify-center p-1">
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="text-white font-black text-2xl tracking-tighter italic hover:opacity-90 transition">
            INES TV
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-semibold">
            <Link href="/" className="text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-white">
              Home
            </Link>
            <button className="text-white/60 hover:text-white transition flex items-center gap-1">
              Sports <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <Link href="/live" className="text-white/60 hover:text-white transition flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live TV
            </Link>
            <Link href="/schedule" className="text-white/60 hover:text-white transition">
              Schedule
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white/70 hover:text-white transition p-2 rounded-lg hover:bg-white/5">
            <Search className="w-4.5 h-4.5" />
          </button>
          <button className="text-[13px] font-semibold text-white/70 hover:text-white transition hidden sm:block">
            Login
          </button>
          <button className="bg-white text-black px-5 py-2 rounded-lg font-bold text-[13px] hover:bg-gray-100 transition-all hover:shadow-lg hover:shadow-white/10">
            Sign up
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-10 w-3/4" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 to-transparent z-10 h-40" />
          <img
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-20 px-8 lg:px-14 w-full max-w-[1400px] mb-28">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live Now</span>
          </div>
          <h2 className="text-lg font-semibold text-white/80 mb-1">Live stream &amp; highlights on</h2>
          <div className="text-white font-black text-5xl lg:text-7xl tracking-tighter mb-5 italic">
            INES TV
          </div>
          <p className="text-[15px] text-gray-400 max-w-lg mb-8 leading-relaxed">
            Watch live football matches, highlights and exclusive sports content.
            Subscribe and stream from any device.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-white text-black px-8 py-3.5 rounded-xl font-bold text-[14px] hover:bg-gray-100 transition-all hover:shadow-xl hover:shadow-white/10 flex items-center gap-2 group">
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" />
              Watch Now
            </button>
            <button className="border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-[14px] hover:bg-white/5 transition-all flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="px-8 lg:px-14 mb-12 relative z-20 -mt-10">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button className="whitespace-nowrap bg-white text-black px-5 py-2 rounded-full font-bold text-[13px] hover:bg-gray-100 transition-all">
            All Sports
          </button>
          {filters.map((sport, i) => (
            <button key={sport} className="whitespace-nowrap bg-white/5 border border-white/10 text-white/80 px-5 py-2 rounded-full font-semibold text-[13px] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2">
              <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                <img src={`https://picsum.photos/seed/${i + 10}/20/20`} alt="" className="w-full h-full object-cover" />
              </div>
              {sport}
            </button>
          ))}
        </div>
      </section>

      {/* LIVE & UPCOMING */}
      <section className="px-8 lg:px-14 mb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Live &amp; Upcoming</h3>
            <span className="text-[10px] text-red-500 font-bold px-2.5 py-1 border border-red-500/30 rounded-full animate-pulse bg-red-500/5">
              LIVE
            </span>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white">
              {"<"}
            </button>
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/60 hover:text-white">
              {">"}
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[260px] lg:min-w-[300px] flex-shrink-0">
                <div className="aspect-[16/9] bg-gray-900 rounded-xl animate-pulse mb-2" />
                <div className="h-4 bg-gray-900 rounded w-3/4 animate-pulse mb-1" />
                <div className="h-3 bg-gray-900/50 rounded w-1/2 animate-pulse" />
              </div>
            ))
          ) : matches.length > 0 ? matches.map((match, i) => (
            <div key={match.id || i} className="min-w-[260px] lg:min-w-[300px] flex-shrink-0 cursor-pointer group">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2.5 border border-white/5 group-hover:border-white/20 transition-all">
                {/* Team halves */}
                <div className={`absolute inset-0 flex`}>
                  <div className={`w-1/2 h-full flex items-center justify-center ${['bg-[#001489]', 'bg-[#d32f2f]', 'bg-[#6c1d45]', 'bg-[#1b5e20]', 'bg-[#0d47a1]', 'bg-[#e65100]'][i % 6]}`}>
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[11px] text-white border border-white/10">
                      {match.home?.name?.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                  <div className={`w-1/2 h-full flex items-center justify-center ${['bg-white', 'bg-[#1a237e]', 'bg-[#004d40]', 'bg-[#f9a825]', 'bg-[#880e4f]', 'bg-black'][i % 6]}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-[11px] border ${i % 6 === 0 ? 'bg-black/10 text-black border-black/10' : 'bg-white/15 text-white border-white/10'} backdrop-blur-sm`}>
                      {match.away?.name?.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Score badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-black/90 backdrop-blur-md text-white text-sm font-black px-4 py-2 rounded-lg border border-white/10 shadow-2xl">
                    {match.status?.scoreStr || "VS"}
                  </div>
                </div>

                {/* Live badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {match.status?.liveTime?.short || "LIVE"}
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-[14px] text-white group-hover:text-gray-300 transition line-clamp-1">
                {match.home?.name} vs {match.away?.name}
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Matchday • {match.status?.scoreStr || "Starting Soon"}
              </p>
            </div>
          )) : (
            <p className="text-gray-600 italic text-sm py-8">Aucun match en direct pour le moment</p>
          )}
        </div>
      </section>

      {/* BEST OF FOOTBALL */}
      <section className="px-8 lg:px-14 mb-16">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold">Best of Football</h3>
          <button className="text-[13px] text-white/50 hover:text-white transition flex items-center gap-1 font-medium">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {HIGHLIGHTS.map((item, i) => (
            <div key={i} className="min-w-[300px] lg:min-w-[340px] flex-shrink-0 group cursor-pointer">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-2.5 border border-white/5 group-hover:border-white/15 transition-all">
                <img
                  src={`https://images.unsplash.com/${item.img}?q=80&w=600&auto=format&fit=crop`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={item.title}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="bg-black/80 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    {["12:34", "8:21", "15:07", "10:45", "6:58", "11:22"][i]}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                  <div className="h-full bg-red-500" style={{ width: `${[65, 30, 80, 45, 90, 15][i]}%` }} />
                </div>
              </div>

              <h4 className="font-bold text-[14px] text-white line-clamp-1 group-hover:text-gray-300 transition">{item.title}</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR LEAGUES */}
      <section className="px-8 lg:px-14 mb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold">Popular Leagues</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {LEAGUES.map((league, i) => (
            <button
              key={i}
              className={`bg-gradient-to-br ${league.color} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-lg group cursor-pointer min-h-[100px]`}
            >
              <span className="text-2xl">{league.emoji}</span>
              <span className="text-[11px] font-bold text-white/90 text-center leading-tight">{league.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section className="px-8 lg:px-14 mb-16">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold">Trending Now</h3>
          </div>
          <button className="text-[13px] text-white/50 hover:text-white transition flex items-center gap-1 font-medium">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Champions League Recap", desc: "All goals from matchday 5", tag: "UCL" },
            { title: "Transfer Window Update", desc: "Latest deals and rumours", tag: "MERCATO" },
            { title: "Top 10 Goals of the Week", desc: "The best strikes from across Europe", tag: "GOALS" },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                  {item.tag}
                </span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition" />
              </div>
              <h4 className="font-bold text-[15px] mb-1 group-hover:text-gray-200 transition">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-8 lg:px-14 mb-16">
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=50&w=1200&auto=format')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <Tv className="w-5 h-5 text-white/80" />
              <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Premium</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black mb-3">
              Never miss a match again
            </h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Get unlimited access to live matches, exclusive highlights and multi-screen viewing with INES TV Premium.
            </p>
            <div className="flex gap-3">
              <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-[13px] hover:bg-gray-100 transition-all hover:shadow-xl">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-[13px] hover:bg-white/10 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 mt-8">
        <div className="px-8 lg:px-14 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="text-white font-black text-xl tracking-tighter italic mb-4">INES TV</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your premium destination for live sports streaming and highlights.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Browse</h5>
              <ul className="space-y-2">
                {["Live TV", "Sports", "Schedule", "Highlights"].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-gray-500 hover:text-white transition">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Help</h5>
              <ul className="space-y-2">
                {["FAQ", "Contact Us", "Devices", "Terms"].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-gray-500 hover:text-white transition">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h5>
              <ul className="space-y-2">
                {["Sign In", "My Account", "Redeem", "Privacy"].map(item => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-gray-500 hover:text-white transition">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-gray-600">
              © 2026 INES TV. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {["Twitter", "Instagram", "YouTube"].map(social => (
                <Link key={social} href="#" className="text-[11px] text-gray-600 hover:text-gray-400 transition">
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
