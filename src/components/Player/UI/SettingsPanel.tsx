"use client";

import React from "react";
import { Settings, Check, Zap, Gauge, Monitor } from "lucide-react";

interface SettingsPanelProps {
  levels: { id: number; name: string }[];
  currentLevel: number;
  onSetLevel: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ levels, currentLevel, onSetLevel, isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-6 top-20 bottom-32 w-64 z-[70] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Settings size={14} className="text-emerald-500" />
        <h4 className="text-xs font-black text-white uppercase tracking-widest">Video Settings</h4>
      </div>

      <div className="space-y-6">
        {/* QUALITY SELECTOR */}
        <section>
          <div className="flex items-center gap-2 mb-3">
             <Monitor size={10} className="text-white/40" />
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Streaming Quality</p>
          </div>
          <div className="space-y-1.5">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onSetLevel(lvl.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                  currentLevel === lvl.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                   {lvl.name === "Auto" ? <Zap size={10} /> : <Gauge size={10} />}
                   {lvl.name}
                </span>
                {currentLevel === lvl.id && <Check size={10} />}
              </button>
            ))}
          </div>
        </section>

        {/* AUDIO TRACKS (Placeholder) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Audio Language</p>
          </div>
          <button className="w-full text-left px-3 py-2.5 bg-white/5 text-white/60 rounded-xl text-[11px] font-bold opacity-50 cursor-not-allowed">
            Original (Default)
          </button>
        </section>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5">
        <p className="text-[9px] text-white/20 font-medium leading-relaxed italic text-center">
          Manual bitrate selection may affect playback stability on unstable networks.
        </p>
      </div>
    </div>
  );
}
