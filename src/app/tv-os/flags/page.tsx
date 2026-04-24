export default function FlagsPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
       <div className="w-20 h-20 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-3xl">🧨</div>
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">Feature Flags</h1>
          <p className="text-gray-500 max-w-md">Kill-switches de production. Activez ou désactivez les moteurs AI en temps réel.</p>
       </div>
       <div className="flex flex-col gap-4 w-full max-w-sm">
          {[1,2,3].map(i => (
             <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl opacity-50">
                <div className="h-4 w-32 bg-white/10 rounded"></div>
                <div className="h-6 w-12 bg-white/10 rounded-full"></div>
             </div>
          ))}
       </div>
    </div>
  )
}
