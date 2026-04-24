"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { StreamSource, Channel } from "@/types";
import VideoCoreDual from "./VideoCoreDual";
import { getNextSource } from "./BufferManager";
import { selectBestSource } from "@/utils/streams/latencySelector";
import { getBestCDNFromCache } from "@/utils/streams/qoeEngine";
import { trackStreamEvent } from "@/services/analytics";

export interface PlayerStats {
  bitrate: number;
  buffer: number;
  latency: number;
  droppedFrames: number;
  cdn: string;
  resolution: string;
  zappingLatency: number;
}

export interface UltraPlayerRef {
  handleSeek: (offset: number) => void;
  zapToLive: () => void;
  setQuality: (level: number) => void;
  currentLevel: number;
  levels: { id: number; name: string }[];
  getStats: () => PlayerStats;
  video: HTMLVideoElement;
}

type Props = {
  streamSources: StreamSource[];
  channelId: string;
  currentChannel?: Channel;
  nextChannel?: Channel;
  prevChannel?: Channel;
  poster?: string;
  onError?: (msg: string) => void;
  // Optional context props (passed by callers, not used internally)
  streamUrl?: string;
  streamUrls?: any;
  sessionId?: string | null;
  nextChannelId?: string;
  prevChannelId?: string;
  deviceId?: string;
  error?: string | null;
};

const UltraPlayer = forwardRef<UltraPlayerRef, Props>(({ streamSources, channelId, poster, onError }, ref) => {
  const [current, setCurrent] = useState<StreamSource | null>(null);
  const [next, setNext] = useState<StreamSource | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const switchingRef = useRef(false);

  // ── Stats & Ref Compatibility ──
  useImperativeHandle(ref, () => ({
    handleSeek: (offset) => { if (videoRef.current) videoRef.current.currentTime += offset; },
    zapToLive: () => {
      if (!videoRef.current || !videoRef.current.seekable.length) return;
      videoRef.current.currentTime = videoRef.current.seekable.end(videoRef.current.seekable.length - 1);
    },
    setQuality: () => {},
    currentLevel: -1,
    levels: [],
    getStats: () => ({
      bitrate: 0, buffer: 0, latency: 0, droppedFrames: 0,
      cdn: current?.cdn || "DEFAULT",
      resolution: "AUTO", zappingLatency: 0
    }),
    video: videoRef.current!
  }));

  // Tracker for session stop
  useEffect(() => {
    return () => {
      if (channelId) {
        trackStreamEvent({
          channel_id: channelId,
          event_type: "stop"
        });
      }
    };
  }, [channelId]);

  // 🔥 INTELLIGENT INIT (QoE + Latency + Fallback)
  useEffect(() => {
    if (!streamSources.length) return;

    const init = async () => {
      console.info("[QoE] Selecting best source for channel:", channelId);

      // 🧠 1. Try QoE cache (Historical quality)
      let best = getBestCDNFromCache(streamSources);

      // ⚡ 2. Fallback to latency test (Real-time speed)
      if (!best) {
        best = await selectBestSource(streamSources);
      }

      if (!best) {
          best = streamSources[0]; // Ultimate fallback
      }

      const nextSource = getNextSource(streamSources, best.url);

      setCurrent(best);
      setNext(nextSource);

      console.info("[QoE] Selected CDN:", best.cdn || best.label);
    };

    init();
  }, [streamSources, channelId]);

  // 🔁 ERROR HANDLER → INSTANT SWITCH
  const handleError = () => {
    if (!current || !next || switchingRef.current) return;

    switchingRef.current = true;
    console.warn("[QoE Failover] Switching CDN");

    if (channelId) {
      trackStreamEvent({
        channel_id: channelId,
        event_type: "switch",
        cdn: next.cdn || next.label,
        metadata: { from: current.cdn || current.label }
      });
    }

    setCurrent(next);

    const nextAfter = getNextSource(streamSources, next.url);
    setNext(nextAfter);

    setTimeout(() => {
        switchingRef.current = false;
    }, 1000);
  };

  if (!current) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/20 uppercase tracking-widest text-xs">
        Optimizing stream...
      </div>
    );
  }

  return (
    <VideoCoreDual
      ref={videoRef}
      primarySrc={current.url}
      secondarySrc={next?.url}
      primaryCdn={current.cdn || current.label}
      secondaryCdn={next?.cdn || next?.label}
      channelId={channelId}
      type={current.type}
      onError={handleError}
    />
  );
});

UltraPlayer.displayName = "UltraPlayer";
export default UltraPlayer;
