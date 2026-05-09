"use client";

import { Play } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomeCarousels() {
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

  return (
    <>
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
                   <img src={`https://images.unsplash.com/photo-1551280857-2b9bbe5240f5?q=80&w=600&auto=format&fit=crop&sig=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Thumbnail" loading="lazy" />
                   
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
                         <img src={`https://picsum.photos/seed/${i*2}/20/20`} className="w-full h-full object-cover rounded-sm" alt="" loading="lazy"/>
                      </div>
                      <div className="w-6 h-6 rounded bg-white/10 backdrop-blur p-0.5 border border-white/20">
                         <img src={`https://picsum.photos/seed/${i*3}/20/20`} className="w-full h-full object-cover rounded-sm" alt="" loading="lazy"/>
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
    </>
  );
}
