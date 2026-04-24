"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

interface ErrorRecoveryProps {
  isVisible: boolean;
  onRetry: () => void;
  error?: string;
}

export default function ErrorRecovery({ isVisible, onRetry, error }: ErrorRecoveryProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRetry();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onRetry]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-zinc-950/95 flex items-center justify-center p-8 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-8">
        {/* ICON ANIMATION */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-full h-full bg-red-950/40 rounded-full border border-red-500/30 text-red-500">
            <WifiOff size={40} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">
            <AlertTriangle size={12} /> Critical Connection Issue
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Channel Unavailable</h2>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            The stream source is temporarily unreachable. Our multi-CDN engine is attempting a hard reconnect.
          </p>
          {error && <p className="text-red-400/60 text-[10px] font-mono mt-2 bg-black/40 p-2 rounded border border-white/5 uppercase">Error: {error}</p>}
        </div>

        <div className="flex flex-col items-center gap-4 pt-6">
          <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div 
               className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-1000" 
               style={{ width: `${(countdown / 5) * 100}%` }}
             />
          </div>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Reconnecting in {countdown}s...
          </p>
          
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-3 bg-white text-black font-black text-xs rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <RefreshCw size={14} className="animate-spin" /> Retry Now
          </button>
        </div>

        <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[10px] font-black text-white uppercase tracking-widest leading-relaxed">
             Error Protocol: 0xNETWORK_TIMEOUT_RETRY <br />
             All CDN Layers Exhausted
           </p>
        </div>
      </div>
    </div>
  );
}
