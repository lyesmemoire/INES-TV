import React from 'react';
import { Cpu, Wifi, Settings, AlertTriangle, Info } from 'lucide-react';
import { DeviceTier } from '../../types';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

export function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-lg border border-white/10 p-5 rounded-2xl flex flex-col gap-3 hover:bg-zinc-800/80 transition-all duration-300 shadow-xl hover:shadow-2xl group">
      <div className={`${color} bg-black/40 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white mt-1 drop-shadow-md">{value}</p>
      </div>
    </div>
  );
}

interface MetricsPanelProps {
  tier: DeviceTier;
  buffer: string;
  apiStatus: string;
}

export default function MetricsPanel({ tier, buffer, apiStatus }: MetricsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<Cpu />} label="UI Rendering" value={tier === 'LOW' ? 'Basic (No Anim)' : '60fps Compose'} color="text-amber-400" />
        <MetricCard icon={<Wifi />} label="Network Strategy" value={tier === 'LOW' ? 'Polling 15s' : 'WebSocket SSE'} color="text-blue-400" />
        <MetricCard icon={<Settings />} label="Buffer Strategy" value={buffer} color="text-emerald-400" />
        <MetricCard icon={<AlertTriangle />} label="Image Quality" value={tier === 'LOW' ? 'RGB_565 (Low RAM)' : 'ARGB_8888 (HD)'} color="text-purple-400" />
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -z-10"></div>

        <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-white">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <Info size={18} className="text-emerald-400" />
          </div>
          Stratégie {tier} en cours
        </h3>
        
        <div className="mb-5 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-sm font-medium text-emerald-300 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          {apiStatus}
        </div>
        
        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
          {tier === 'LOW' 
            ? "Sur une TV Box Low-End (ex: 1Go RAM), l'application désactive les animations lourdes, augmente drastiquement le buffer vidéo pour éviter les coupures, et utilise des images compressées (RGB_565) pour éviter les crashs OutOfMemory."
            : tier === 'MID'
            ? "Sur un smartphone moyen de gamme, l'application équilibre la qualité visuelle et la consommation de batterie. Le buffer est standard et la résolution plafonne à 1080p."
            : "Sur un appareil High-End, l'application active le mode Low-Latency pour le direct, les animations fluides (60fps), et maintient une connexion WebSocket ouverte pour les statistiques en temps réel avec une qualité maximale (4K ready)."}
        </p>
        
        <div className="bg-black/80 p-5 rounded-xl border border-white/10 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <pre className="text-xs font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
            {tier === 'LOW' ? `// ExoPlayer Low-End Config
loadControl.setBufferDurationsMs(
  30_000, // Min buffer 30s
  60_000, // Max buffer 60s
  2_500,  // Playback start
  5_000   // Resume after rebuffer
)
trackSelector.setMaxVideoSize(1280, 720)
trackSelector.setMaxVideoBitrate(2_500_000)` : `// ExoPlayer High-End Config
loadControl.setBufferDurationsMs(
  15_000, // Min buffer 15s
  30_000, // Max buffer 30s
  1_000,  // Playback start (Fast)
  2_000   // Resume after rebuffer
)
// WebSocket SSE enabled for live stats`}
          </pre>
        </div>
      </div>
    </div>
  );
}
