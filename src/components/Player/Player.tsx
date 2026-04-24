import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import UltraPlayer, { UltraPlayerRef } from "./UltraPlayer";
import AdsManager from "./AdsManager";
import PremiumOverlay from "./PremiumOverlay";
import { useAuth } from "../../context/AuthContext";
import { resolveSources } from "../../utils/streams/resolveSources";
import { Channel, StreamSource } from "../../types";

interface PlayerProps {
  channelId: string;
  nextChannelId?: string;
  prevChannelId?: string;
  currentChannel: Channel;
  nextChannel?: Channel;
  prevChannel?: Channel;
  onOpenPremium?: () => void;
  onError?: (msg: string) => void;
  poster?: string;
  // Optional props passed by some callers, not used by Player internals
  streamUrl?: string;
  streamUrls?: string[];
}

const Player = forwardRef<UltraPlayerRef, PlayerProps>(({ 
  poster, 
  channelId, 
  nextChannelId, 
  prevChannelId, 
  currentChannel,
  nextChannel,
  prevChannel,
  onOpenPremium,
  onError 
}, ref) => {
  const { token } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [adsFinished, setAdsFinished] = useState(false);
  const [resolvedSources, setResolvedSources] = useState<StreamSource[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [adTag, setAdTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('unknown');
  const internalVideoRef = useRef<UltraPlayerRef>(null);

  // Bubble up the ref
  useImperativeHandle(ref, () => internalVideoRef.current!);

  // 1. Device ID Management
  useEffect(() => {
    let currentDevice = localStorage.getItem('__stream_device_id');
    if (!currentDevice) {
      currentDevice = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('__stream_device_id', currentDevice);
    }
    setDeviceId(currentDevice);
  }, []);

  // 2. 🔐 SECURE URL & PREMIUM ORCHESTRATION
  useEffect(() => {
    if (!channelId) return;

    const fetchSecureSession = async () => {
      try {
        console.log(`[Player] 🎫 Refreshing secure M3U for ${channelId}`);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/streams/play/${channelId}`, { headers });
        const data = await res.json();
        
        // ── Standardize Sources ──
        const backendSources = data.sources || (data.url ? [{ url: data.url, type: 'hls' }] : []);
        const normalized = resolveSources(currentChannel, backendSources);
        setResolvedSources(normalized);
        
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.adTag) setAdTag(data.adTag);
        if (data.error) setError(data.error); else setError(null);
        
        // ── Logic Premium / Ads ──
        if (data.isPremium || !data.showAds) {
          setIsPremium(true);
          setAdsFinished(true);
        } else {
          setIsPremium(false);
          setAdsFinished(false); // Force ads if backend says showAds: true
        }
      } catch (e) {
        console.error("Failed to refresh secure stream session", e);
      }
    };

    fetchSecureSession();

    // ── 🧠 URL ROTATION (4 min) ──
    const rotationTimer = setInterval(fetchSecureSession, 4 * 60 * 1000);

    return () => clearInterval(rotationTimer);
  }, [channelId, token]);

  const finalStreams = resolvedSources;

  return (
    <div className="relative w-full h-full bg-black rounded-b-3xl md:rounded-3xl overflow-hidden group">
      {adsFinished && finalStreams.length > 0 ? (
          <UltraPlayer 
            ref={internalVideoRef} 
            streamSources={finalStreams} 
            poster={poster} 
            channelId={channelId || "default"} 
            sessionId={sessionId}
            nextChannelId={nextChannelId}
            prevChannelId={prevChannelId}
            currentChannel={currentChannel}
            nextChannel={nextChannel}
            prevChannel={prevChannel}
            deviceId={deviceId}
            error={error}
            onError={onError}
          />


      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
          <img src={poster || ""} alt="Poster" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="z-10 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/50 text-xs font-bold tracking-widest uppercase">Initialisation Sécurisée...</p>
          </div>
        </div>
      )}

      {/* ── MANDATORY ADS (Free Users Only) ── */}
      {!isPremium && !adsFinished && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="absolute top-8 left-8 text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                StreamPerf Protocol
            </div>
            <AdsManager 
                adTag={adTag}
                onFinish={() => setAdsFinished(true)} 
            />

            <button 
                onClick={onOpenPremium}
                className="mt-8 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
                Passer au Premium pour retirer les publicités →
            </button>
        </div>
      )}

      {isPremium && (
        <div className="absolute top-4 right-4 z-40 bg-blue-600/20 backdrop-blur-md px-2 py-1 rounded border border-blue-500/20 pointer-events-none">
            <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Premium Active</span>
        </div>
      )}
    </div>
  );
});

Player.displayName = "Player";
export default Player;
