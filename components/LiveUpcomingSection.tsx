"use client";
import Link from "next/link";

export function LiveUpcomingSection({ matches = [], type = "live" }: { matches?: any[], type?: "live" | "upcoming" }) {
  if (matches.length === 0) {
    return <p className="text-gray-500 italic text-sm py-4">Chargement des matchs...</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {matches.map((match, i) => (
         <Link href={`/watch/${match.channelId || 'bein_sport_1'}`} key={match.id || i} className="min-w-[240px] lg:min-w-[280px] flex-shrink-0 cursor-pointer group block">
            <div className="relative aspect-[16/9] rounded-md overflow-hidden mb-2 flex border border-gray-800 group-hover:border-gray-500 transition-colors">
               <div className={`w-1/2 h-full flex items-center justify-center ${i % 2 === 0 ? 'bg-[#001489]' : 'bg-[#e53238]'}`}>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-lg border border-white/10 text-center leading-tight">
                     {match.home?.name?.substring(0, 3).toUpperCase() || "HOM"}
                  </div>
               </div>
               <div className={`w-1/2 h-full flex items-center justify-center ${i % 3 === 0 ? 'bg-white text-black' : 'bg-[#000000]'}`}>
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[10px] text-current shadow-lg border border-black/10 text-center leading-tight">
                     {match.away?.name?.substring(0, 3).toUpperCase() || "AWY"}
                  </div>
               </div>
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
               
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-black/90 backdrop-blur text-white text-[12px] font-black px-3 py-1.5 rounded border border-gray-700">
                    {match.status?.scoreStr || "VS"}
                  </div>
               </div>

               <div className="absolute top-2 left-2 z-10">
                  <div className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${type === 'live' ? 'bg-red-600' : 'bg-gray-600'}`}>
                    {match.status?.liveTime?.short || (type === "live" ? "LIVE" : "UPCOMING")}
                  </div>
               </div>
            </div>
            <h4 className="font-bold text-[14px] text-white group-hover:text-gray-300 transition line-clamp-1">
              {match.home?.name || "Team 1"} vs {match.away?.name || "Team 2"}
            </h4>
            <p className="text-xs text-gray-500 font-medium">Matchday • {match.status?.scoreStr || "Starting Soon"}</p>
         </Link>
      ))}
    </div>
  );
}
