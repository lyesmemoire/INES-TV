export default function AnalyticsPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
       <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl">💓</div>
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">Analytics Heartbeat</h1>
          <p className="text-gray-500 max-w-md">Flux brut d'événements de visionnage et fréquences de zapping.</p>
       </div>
       <div className="flex gap-4">
          <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
             <div className="w-2/3 h-full bg-blue-500 animate-[shimmer_2s_infinite]"></div>
          </div>
       </div>
    </div>
  )
}
