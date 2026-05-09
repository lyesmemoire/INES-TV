"use client";

import { Menu, Search, ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomeClient() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/football')
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success' && data.response?.live) {
           setMatches(data.response.live.slice(0, 10));
        }
      })
      .catch(err => console.error("Error fetching live matches", err));
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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans pb-20">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="text-white hover:text-gray-300 transition flex items-center justify-center">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-white font-black text-3xl tracking-tighter pr-4 italic">
            INES TV
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold tracking-wide">
            <Link href="/" className="text-yellow-400 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-yellow-400">
              Home
            </Link>
            <button className="text-white hover:text-gray-300 transition flex items-center gap-1">
              Sports <ChevronDown className="w-4 h-4" />
            </button>
            <Link href="/live" className="text-white hover:text-gray-300 transition">
              Live TV
            </Link>
            <Link href="/schedule" className="text-white hover:text-gray-300 transition">
              Schedule
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-white hover:text-gray-300 transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-[15px] font-bold text-white hover:text-gray-300 transition">
            Login
          </button>
          <button className="bg-white text-black px-4 py-1.5 rounded font-bold text-[15px] hover:bg-gray-200 transition">
            Sign up
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] flex items-end">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 to-transparent z-10 h-32" />
          
          <img 
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-80"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 px-8 lg:px-12 w-full max-w-[1400px] mb-24">
          <h2 className="text-xl font-bold mb-1 tracking-wide">Live stream highlights on</h2>
          <div className="text-white font-black text-6xl tracking-tighter mb-4 italic">
            INES TV
          </div>
          <p className="text-[15px] text-gray-300 max-w-md mb-6 leading-relaxed font-medium">
            Watch highlights and top moments of matches.<br/>
            Subscribe and watch from your devices.
          </p>
          <button className="bg-white text-black px-8 py-3 rounded font-bold text-[15px] hover:bg-gray-200 transition">
            Watch Now
          </button>
        </div>
      </section>

      {/* FILTERS */}
      <section className="px-8 lg:px-12 mb-10 relative z-20 mt-[-40px]">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button className="whitespace-nowrap bg-white text-black px-4 py-1.5 rounded border border-white font-bold text-sm hover:bg-gray-200 transition">
            All Sports
          </button>
          {filters.map((sport, i) => (
            <button key={sport} className="whitespace-nowrap bg-black/60 border border-gray-700 text-white px-4 py-1.5 rounded font-bold text-sm hover:border-gray-400 transition flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[8px] overflow-hidden">
                <img src={`https://picsum.photos/seed/${i}/20/20`} alt="" className="w-full h-full object-cover opacity-80"/>
              </div>
              {sport}
            </button>
          ))}
        </div>
      </section>

      {/* BEST OF FOOTBALL */}
      <section className="px-8 lg:px-12 mb-12">
        <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
          Best of Football
          <div className="flex gap-2">
             <button className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-gray-800 transition">{"<"}</button>
             <button className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-gray-800 transition">{">"}</button>
          </div>
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="min-w-[280px] lg:min-w-[320px] flex-shrink-0 group cursor-pointer">
                <div className="relative aspect-video bg-gray-900 rounded-md overflow-hidden mb-2 border border-gray-800 group-hover:border-gray-500 transition-colors">
                   <img src={`https://images.unsplash.com/photo-1551280857-2b9bbe5240f5?q=80&w=600&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Thumbnail" />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/50 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                         <Play className="w-5 h-5 text-white group-hover:text-black ml-1 transition-colors duration-300" />
                      </div>
                   </div>

                   <div className="absolute top-2 left-2">
                      <div className="bg-[#ff0000] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm tracking-wider uppercase">Live</div>
                   </div>

                   <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <div className="w-6 h-6 rounded bg-white/10 backdrop-blur p-0.5 border border-white/20">
                         <img src={`https://picsum.photos/seed/${i*2}/20/20`} className="w-full h-full object-cover rounded-sm" alt=""/>
                      </div>
                      <div className="w-6 h-6 rounded bg-white/10 backdrop-blur p-0.5 border border-white/20">
                         <img src={`https://picsum.photos/seed/${i*3}/20/20`} className="w-full h-full object-cover rounded-sm" alt=""/>
                      </div>
                   </div>

                   <div className="absolute bottom-0 left-0 h-1 bg-red-600 w-2/3" />
                </div>
                <h4 className="font-bold text-[15px] text-white line-clamp-1 group-hover:text-gray-300 transition">Real Madrid vs Barcelona</h4>
                <p className="text-xs text-gray-400 font-medium">LaLiga Highlights</p>
             </div>
          ))}
        </div>
      </section>

      {/* LIVE & UPCOMING */}
      <section className="px-8 lg:px-12 mb-20">
        <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
          <div className="flex items-center">
            Live &amp; Upcoming
            <span className="text-xs text-red-500 font-bold ml-3 px-2 py-0.5 border border-red-500 rounded animate-pulse">LIVE</span>
          </div>
          <div className="flex gap-2">
             <button className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-gray-800 transition">{"<"}</button>
             <button className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-gray-800 transition">{">"}</button>
          </div>
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {matches.length > 0 ? matches.map((match, i) => (
             <div key={match.id || i} className="min-w-[240px] lg:min-w-[280px] flex-shrink-0 cursor-pointer group">
                <div className="relative aspect-[16/9] rounded-md overflow-hidden mb-2 flex border border-gray-800 group-hover:border-gray-500 transition-colors">
                   <div className={`w-1/2 h-full flex items-center justify-center ${i % 2 === 0 ? 'bg-[#001489]' : 'bg-[#e53238]'}`}>
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-lg border border-white/10 text-center leading-tight">
                         {match.home?.name?.substring(0, 3).toUpperCase()}
                      </div>
                   </div>
                   <div className={`w-1/2 h-full flex items-center justify-center ${i % 3 === 0 ? 'bg-white text-black' : 'bg-[#000000]'}`}>
                      <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[10px] text-current shadow-lg border border-black/10 text-center leading-tight">
                         {match.away?.name?.substring(0, 3).toUpperCase()}
                      </div>
                   </div>
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                   
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-black/90 backdrop-blur text-white text-[12px] font-black px-3 py-1.5 rounded border border-gray-700">
                        {match.status?.scoreStr || "VS"}
                      </div>
                   </div>

                   <div className="absolute top-2 left-2 z-10">
                      <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        {match.status?.liveTime?.short || "LIVE"}
                      </div>
                   </div>
                </div>
                <h4 className="font-bold text-[14px] text-white group-hover:text-gray-300 transition line-clamp-1">
                  {match.home?.name} vs {match.away?.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium">Matchday ÔÇó {match.status?.scoreStr || "Starting Soon"}</p>
             </div>
          )) : (
            <p className="text-gray-500 italic text-sm py-4">Chargement des matchs en direct...</p>
          )}
        </div>
      </section>
    </div>
  );
}
