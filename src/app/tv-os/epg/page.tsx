export default function EpgPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
       <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-3xl">📡</div>
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">EPG Simulator</h1>
          <p className="text-gray-500 max-w-md">L'outil de synchronisation des grilles de programmes en temps réel pour le TV OS Brain.</p>
       </div>
       <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-gray-400 uppercase tracking-widest italic animate-pulse">
         Deployment in progress...
       </div>
    </div>
  )
}
