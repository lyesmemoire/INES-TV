"use client"

export default function UserSessionsMap() {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Global Distribution Map</h2>
        <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-600/30">
          BETA
        </div>
      </div>
      <div className="h-64 rounded-xl border border-dashed border-gray-700 bg-gray-950 flex flex-col items-center justify-center text-gray-500 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-cover opacity-10 mix-blend-screen filter grayscale"></div>
        <svg className="w-12 h-12 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="relative z-10 font-medium">Map view requires external API key</span>
        <span className="relative z-10 text-sm mt-1 opacity-70">Will be activated in production</span>
      </div>
    </div>
  )
}
