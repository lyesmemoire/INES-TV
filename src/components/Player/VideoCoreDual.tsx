"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import Hls from "hls.js";
import { saveQoEScore } from "@/utils/streams/qoeEngine";
import { trackStreamEvent } from "@/services/analytics";

interface VideoCoreDualProps {
  primarySrc: string;
  secondarySrc?: string;
  primaryCdn?: string;
  secondaryCdn?: string;
  channelId?: string; // Added for analytics
  type?: 'hls' | 'dash';
  onError?: () => void;
}

/**
 * 🎬 VIDEO CORE DUAL: SEAMLESS CDN ENGINE WITH QoE TRACKING
 * Uses two video elements for zero-gap switching between primary and backup sources.
 * Tracks performance metrics to feed the QoE self-learning engine.
 */
const VideoCoreDual = forwardRef<HTMLVideoElement, VideoCoreDualProps>(({
  primarySrc,
  secondarySrc,
  primaryCdn,
  secondaryCdn,
  channelId,
  type = 'hls',
  onError,
}, ref) => {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const hlsARef = useRef<Hls | null>(null);
  const hlsBRef = useRef<Hls | null>(null);

  const [active, setActive] = useState<"A" | "B">("A");

  // Sync external ref with the CURRENT ACTIVE video element
  useImperativeHandle(ref, () => (active === "A" ? videoARef.current! : videoBRef.current!));

  // 🔵 LOAD PRIMARY (VIDEO A)
  useEffect(() => {
    const video = videoARef.current;
    if (!video || !primarySrc) return;

    let startTime = performance.now();
    let rebufferCount = 0;
    let rebufferDuration = 0;
    let lastBufferStart = 0;
    let errorCount = 0;

    const onWaiting = () => {
      rebufferCount++;
      lastBufferStart = performance.now();
      if (active === "A") {
        trackStreamEvent({
          channel_id: channelId || primaryCdn || "unknown",
          event_type: "rebuffer",
          cdn: primaryCdn,
          stream_url: primarySrc,
        });
      }
    };

    const onPlaying = () => {
      if (lastBufferStart) {
        rebufferDuration += performance.now() - lastBufferStart;
        lastBufferStart = 0;
      }
    };

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    if (Hls.isSupported() && type === 'hls') {
      if (hlsARef.current) hlsARef.current.destroy();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        capLevelToPlayerSize: true
      });
      
      hls.loadSource(primarySrc);
      hls.attachMedia(video);
      hlsARef.current = hls;

      hls.on(Hls.Events.ERROR, (_, data) => {
        errorCount++;

        if (active === "A") {
          trackStreamEvent({
            channel_id: channelId || primaryCdn || "unknown",
            event_type: "error",
            cdn: primaryCdn,
            stream_url: primarySrc,
            error_count: errorCount,
          });
        }

        if (data.fatal && active === "A") {
          if (primaryCdn) saveQoEScore(primaryCdn, 9999);
          onError?.();
        }
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (active === "A") {
          video.play().catch(() => {});
          
          const startupTime = performance.now() - startTime;
          const score = startupTime * 0.3 + rebufferDuration * 0.5 + rebufferCount * 20;

          if (primaryCdn) {
            saveQoEScore(primaryCdn, score);
          }

          if (primaryCdn || channelId) {
            trackStreamEvent({
                channel_id: channelId || primaryCdn || "unknown",
                event_type: "start",
                cdn: primaryCdn,
                stream_url: primarySrc,
                startup_time: Math.round(startupTime),
                qoe_score: Math.round(score)
            });
          }
        }
      });
    } else {
      video.src = primarySrc;
      if (active === "A") video.play().catch(() => {});
      
      const handleNativeError = () => {
        if (primaryCdn && active === "A") saveQoEScore(primaryCdn, 9999);
        if (channelId && active === "A") {
            trackStreamEvent({
                channel_id: channelId,
                event_type: "error",
                cdn: primaryCdn,
                stream_url: primarySrc,
                error_count: 1
            });
        }
        if (active === "A") onError?.();
      };
      video.addEventListener('error', handleNativeError);
    }

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      if (hlsARef.current) hlsARef.current.destroy();
    };
  }, [primarySrc, type, primaryCdn]);

  // 🟡 PRELOAD SECONDARY (VIDEO B)
  useEffect(() => {
    const video = videoBRef.current;
    if (!video || !secondarySrc) return;

    if (Hls.isSupported() && type === 'hls') {
      if (hlsBRef.current) hlsBRef.current.destroy();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        autoStartLoad: true,
        startPosition: -1,
      });

      hls.loadSource(secondarySrc);
      hls.attachMedia(video);
      hlsBRef.current = hls;

      video.muted = true;
    } else {
      video.src = secondarySrc;
      video.muted = true;
    }

    return () => {
      if (hlsBRef.current) hlsBRef.current.destroy();
    };
  }, [secondarySrc, type]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoARef}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
          active === "A" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
        autoPlay
        playsInline
        controls={active === "A"}
      />

      <video
        ref={videoBRef}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
          active === "B" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
        autoPlay
        playsInline
        muted={active !== "B"}
        controls={active === "B"}
      />
      
      {/* Dev Metadata - Visible in Debug mode only if needed */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
           Dual-Core Active: {active}
         </span>
      </div>
    </div>
  );
});

VideoCoreDual.displayName = "VideoCoreDual";
export default VideoCoreDual;
