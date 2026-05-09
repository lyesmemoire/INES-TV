"use client";

import { useEffect, useRef } from "react";
import { StreamAPI } from "@/src/lib/api/streams";
import { usePlayerState } from "@/src/hooks/usePlayerState";
import { Loader2, AlertCircle, RotateCw } from "lucide-react";
import VideoCore from "./VideoCore";

interface Props {
  matchId?: string;
}

export default function MatchPlayer({ matchId }: Props) {
  const { state, goToLoading, goToPlaying, goToDegraded, goToOffline } = 
    usePlayerState(matchId);
  
  const loadedRef = useRef(false);
  const failCountRef = useRef(0);
  const maxFailures = 3;

  useEffect(() => {
    if (!matchId || loadedRef.current) return;

    const loadStream = async () => {
      loadedRef.current = true;
      goToLoading();

      const stream = await StreamAPI.getStreamWithRetry(matchId);

      if (!stream) {
        failCountRef.current += 1;

        if (failCountRef.current >= maxFailures) {
          goToOffline(failCountRef.current);
          return;
        }

        goToDegraded("Connection issue - retrying...");
        // Auto-retry après 3s
        setTimeout(() => {
          loadedRef.current = false;
          loadStream();
        }, 3000);
        return;
      }

      failCountRef.current = 0;
      goToPlaying(stream);
    };

    loadStream();
  }, [matchId, goToLoading, goToPlaying, goToDegraded, goToOffline]);

  const handleRetry = () => {
    loadedRef.current = false;
    failCountRef.current = 0;
    // Trigger re-load via effect
    goToLoading();
    // Use a small timeout to let state update before we artificially trigger the load again
    setTimeout(() => {
       const loadStream = async () => {
         loadedRef.current = true;
         const stream = await StreamAPI.getStreamWithRetry(matchId!);
         if (!stream) {
           goToOffline(1);
         } else {
           goToPlaying(stream);
         }
       };
       loadStream();
    }, 100);
  };

  // 🎨 UI RENDERING (jamais de crash)
  
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-[32px] flex flex-col items-center justify-center border border-white/5">
        <Loader2 className="text-zinc-500 animate-spin mb-4" size={32} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading stream...</p>
      </div>
    );
  }

  if (state.status === "offline") {
    return (
      <div className="w-full aspect-video bg-[#0A0A0A] rounded-[32px] flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-red-500/20">
        <AlertCircle className="text-red-500 mb-6" size={48} />
        <h3 className="text-white font-black uppercase tracking-tighter text-2xl mb-2">Stream Unavailable</h3>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px] mb-8">Failed after {state.retryCount} attempts</p>
        
        <button 
          onClick={handleRetry}
          className="bg-zinc-800 hover:bg-white hover:text-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3"
        >
          <RotateCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  if (state.status === "degraded") {
    return (
      <div className="w-full aspect-video bg-zinc-900 rounded-[32px] flex flex-col items-center justify-center border border-yellow-500/20">
        <AlertCircle className="text-yellow-500 mb-4" size={32} />
        <p className="text-yellow-500 font-bold uppercase tracking-widest text-[10px] mb-4">{state.reason}</p>
        <Loader2 className="text-yellow-500/50 animate-spin" size={24} />
      </div>
    );
  }

  if (state.status === "playing") {
    return (
      <div className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden border border-white/5 group">
        {state.stream.type === "facebook" ? (
          <iframe
             src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(state.stream.url)}&show_text=0&autoplay=1`}
             className="w-full h-full"
             style={{ border: "none" }}
             allowFullScreen={true}
             onError={() => goToDegraded("Playback error")}
             allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        ) : state.stream.type === "iframe" ? (
          <iframe
             src={state.stream.url}
             className="w-full h-full"
             style={{ border: "none" }}
             allowFullScreen={true}
             onError={() => goToDegraded("Playback error")}
          />
        ) : (
          <VideoCore src={state.stream.url} type="application/x-mpegURL" poster="/player_poster.jpg" />
        )}
      </div>
    );
  }

  return null;
}
