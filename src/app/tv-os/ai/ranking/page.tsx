export default function RankingPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
       <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-3xl">🧠</div>
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">Ranking RPC Override</h1>
          <p className="text-gray-500 max-w-md">Contrôle direct sur l'algorithme de classement cloud. Ajustez les poids de pertinence en temps réel.</p>
       </div>
       <div className="px-6 py-3 border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
         Syncing with behavior_graph...
       </div>
    </div>
  )
}
