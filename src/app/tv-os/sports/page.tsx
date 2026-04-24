import { adminSupabase as supabase } from "@/lib/supabase"

export const revalidate = 0

export default async function SportsAdmin() {
  // Uses the admin client from lib/supabase

  
  const { data: sports } = await supabase
    .from('sports_events')
    .select('*, channels(name)')
    .order('start_time', { ascending: false })
    
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Sports Control Node</h1>
          <p className="text-gray-400 mt-2 font-medium">Injection manuelle de scores et chrono pour la Phase 1 du Sports-First OS.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg shadow-indigo-500/20">
          + NOUVEAU MATCH
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {sports?.map((match: any) => (
          <div key={match.id} className="bg-[#111115] border border-white/5 rounded-[32px] p-8 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-500">
            <div className="flex items-center gap-12">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                     {match.home_logo ? <img src={match.home_logo} className="w-full h-full object-contain" /> : <span className="text-xs font-black">HOME</span>}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{match.home_team}</span>
               </div>

               <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-4">
                     <span className="text-4xl font-black text-white">{match.score_home}</span>
                     <span className="text-xl font-black text-gray-700">-</span>
                     <span className="text-4xl font-black text-white">{match.score_away}</span>
                  </div>
                  <span className="text-[10px] font-black py-1 px-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 animate-pulse">
                     {match.status === 'live' ? match.match_time : match.status.toUpperCase()}
                  </span>
               </div>

               <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                     {match.away_logo ? <img src={match.away_logo} className="w-full h-full object-contain" /> : <span className="text-xs font-black">AWAY</span>}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{match.away_team}</span>
               </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex flex-col text-right">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{match.competition}</span>
                  <span className="text-sm font-bold text-indigo-400">{match.channels?.name || 'Pas de flux'}</span>
               </div>
               <div className="flex gap-2">
                  <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition">
                     <div className="w-5 h-5 border-2 border-white/20 rounded-full"></div>
                  </button>
                  <button className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black text-white transition uppercase tracking-widest">
                     Edit Live
                  </button>
               </div>
            </div>
          </div>
        ))}
        {(!sports || sports.length === 0) && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
             <p className="text-gray-600 font-bold text-lg italic">Aucun événement sportif détecté. Commencez l'injection pour la TV.</p>
          </div>
        )}
      </div>
    </div>
  )
}
