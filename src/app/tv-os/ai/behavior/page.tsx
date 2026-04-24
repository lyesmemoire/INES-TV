export default function BehaviorPage() {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
       <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-3xl">📊</div>
       <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white">Behavior Graphs</h1>
          <p className="text-gray-500 max-w-md">Visualisation des schémas de navigation utilisateur. Mapping des nœuds de recommandation.</p>
       </div>
       <div className="py-20 w-full max-w-2xl bg-white/[0.02] border border-white/5 rounded-[40px] flex items-center justify-center text-gray-700 font-bold italic">
          Graph Viz Engine Loading...
       </div>
    </div>
  )
}
