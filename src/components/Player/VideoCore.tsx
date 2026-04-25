"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Props {
  src: string | null | undefined;
  type?: string;
  poster?: string;
}

type PlayerState = "idle" | "loading" | "playing" | "error" | "no-stream";

export default function VideoCore({ src, type = "application/x-mpegURL", poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("idle");

  useEffect(() => {
    // ✅ Pas de source = message clair
    if (!src) {
      setState("no-stream");
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setState("loading");

    // HLS STREAM
    if ((type === "application/x-mpegURL" || type === "hls" || type === "m3u") && Hls.isSupported()) {
      const hls = new Hls({
        maxLoadingDelay: 4,
        maxBufferLength: 30,
        enableWorker: true,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState("playing");
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn("[VideoCore] HLS error:", data.type);
          setState("error");
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    }
    // NATIVE VIDEO
    else if (video.canPlayType(type)) {
      video.src = src;
      video.load();

      video.onloadeddata = () => {
        setState("playing");
        video.play().catch(() => {});
      };

      video.onerror = () => {
        setState("error");
      };
    }
    else {
      setState("error");
    }
  }, [src, type]);

  // ✅ PAS DE STREAM CONFIGURÉ
  if (state === "no-stream" || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
        <div className="text-6xl mb-4 animate-pulse">📡</div>
        <p className="text-white font-black text-lg mb-2 uppercase tracking-tighter italic">Stream non configuré</p>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-xs">
          Le lien de diffusion pour ce match n'a pas encore été ajouté. 
          Revenez plus tard ou contactez l'administrateur.
        </p>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (state === "error") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-white font-black text-sm uppercase tracking-widest">Stream indisponible</p>
        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-2">Le flux ne peut pas être chargé ou le lien est expiré</p>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (state === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ VIDEO PLAYER
  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      poster={poster}
      playsInline
      muted
      controls={false}
    />
  );
}
