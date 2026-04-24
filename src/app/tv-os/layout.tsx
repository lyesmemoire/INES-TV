import Link from 'next/link'

export default function TvOsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#070709] text-gray-200 font-sans overflow-hidden">
      
      {/* Sidebar Command Center */}
      <aside className="w-64 bg-[#0d0d12] border-r border-[#1a1a24] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#1a1a24]">
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
            TV OS CONTROL
          </h1>
          <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">Operator Console v8</p>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          <Link href="/tv-os" className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Hub Télémétrique</Link>
          <div className="mt-4 mb-2 px-4 text-[10px] uppercase font-bold tracking-widest text-gray-600">Database</div>
          <Link href="/tv-os/channels" className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Channels Grid (10K+)</Link>
          <Link href="/tv-os/sports" className="px-4 py-3 text-sm font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20">Sports Control Node</Link>
          <Link href="/tv-os/epg" className="px-4 py-3 text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition border border-transparent hover:border-indigo-500/20">EPG Simulator</Link>
          <div className="mt-4 mb-2 px-4 text-[10px] uppercase font-bold tracking-widest text-gray-600">AI Engine</div>
          <Link href="/tv-os/ai/ranking" className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Ranking RPC Override</Link>
          <Link href="/tv-os/ai/behavior" className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Behavior Graphs</Link>
          <div className="mt-4 mb-2 px-4 text-[10px] uppercase font-bold tracking-widest text-gray-600">Infrastructure</div>
          <Link href="/tv-os/analytics" className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Analytics Heartbeat</Link>
          <Link href="/tv-os/flags" className="px-4 py-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition border border-transparent hover:border-emerald-500/20">Feature Flags</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#0a0a0e]">
        {children}
      </main>
      
    </div>
  )
}
