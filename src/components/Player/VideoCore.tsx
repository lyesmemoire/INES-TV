import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from "react";
import Hls from "hls.js";
import axios from "axios";
import AdsManager, { shouldTriggerAd } from "./AdsManager";
import { useAuth } from "../../context/AuthContext";

// Disable WebRTC leak
// @ts-ignore
if (typeof window !== "undefined") { window.RTCPeerConnection = undefined; }

import { saveQoEScore } from "@/utils/streams/qoeEngine";
import { trackStreamEvent } from "@/services/analytics";

interface VideoCoreProps {
  src: string;
  type?: 'hls' | 'dash';
  cdn?: string;
  channelId?: string; // Added for tracking
  onError?: () => void;
}

/**
 * 🎬 VIDEO CORE: DUMB RENDERER WITH QoE TRACKING
 * Simple, high-performance renderer for HLS/DASH streams.
 * Tracks startup time, buffering events, and errors for CDN scoring.
 */
const VideoCore = forwardRef<HTMLVideoElement, VideoCoreProps>(({ src, type = 'hls', cdn, channelId, onError }, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Sync external ref if provided
  useImperativeHandle(ref, () => internalVideoRef.current!);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video || !src) return;

    let startTime = performance.now();
    let rebufferCount = 0;
    let rebufferDuration = 0;
    let lastBufferStart = 0;
    let errorCount = 0;

    const onWaiting = () => {
      rebufferCount++;
      lastBufferStart = performance.now();
      
      trackStreamEvent({
        channel_id: channelId || cdn || "unknown",
        event_type: "rebuffer",
        cdn,
        stream_url: src,
      });
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        capLevelToPlayerSize: true
      });
      
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        const startupTime = performance.now() - startTime;
        const score = startupTime * 0.3 + rebufferDuration * 0.5 + rebufferCount * 20;

        console.info("[VideoCore-QoE]", {
          cdn,
          startupTime: Math.round(startupTime),
          rebufferCount,
          rebufferDuration: Math.round(rebufferDuration)
        });

        if (cdn) {
          saveQoEScore(cdn, score);
        }

        if (cdn || channelId) {
            trackStreamEvent({
                channel_id: channelId || cdn || "unknown",
                event_type: "start",
                cdn,
                stream_url: src,
                startup_time: Math.round(startupTime),
                qoe_score: Math.round(score)
            });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        errorCount++;

        trackStreamEvent({
          channel_id: channelId || cdn || "unknown",
          event_type: "error",
          cdn,
          stream_url: src,
          error_count: errorCount,
        });

        if (data.fatal) {
          console.error("[VideoCore] Fatal HLS error:", data.type);
          if (cdn) saveQoEScore(cdn, 9999);
          if (onError) onError();
        }
      });
    } else {
      // Native fallback or DASH (simple)
      video.src = src;
      video.play().catch(() => {});
      
      const handleNativeError = () => {
        if (cdn) saveQoEScore(cdn, 9999);
        if (channelId) {
            trackStreamEvent({
                channel_id: channelId,
                event_type: "error",
                cdn,
                stream_url: src,
                error_count: 1
            });
        }
        if (onError) onError();
      };
      
      video.addEventListener('error', handleNativeError);
      return () => {
        video.removeEventListener('error', handleNativeError);
      };
    }

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, type, cdn, channelId, onError]);

  return (
    <div className="relative w-full h-full bg-black group overflow-hidden">
      <video
        ref={internalVideoRef}
        controls
        playsInline
        className="w-full h-full object-contain shadow-2xl"
      />
    </div>
  );
});

VideoCore.displayName = "VideoCore";
export default VideoCore;
