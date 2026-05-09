import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Image from 'next/image';

/**
 * 💰 ADS SYSTEM: PRO YIELD (Phase 47)
 * Implements Mid-roll injection (120s) and Weighted Smart Selection.
 */
let lastAdTimestamp = 0;
const AD_INTERVAL = 120; // seconds

/**
 * Check if we should trigger a mid-roll ad based on watch time.
 */
export function shouldTriggerAd(currentTime: number) {
  if (Math.abs(currentTime - lastAdTimestamp) >= AD_INTERVAL) {
    lastAdTimestamp = currentTime;
    return true;
  }
  return false;
}

/**
 * Pick an ad using weighted random selection.
 * Higher weight = Higher probability.
 */
export function pickWeightedAd(ads: any[]) {
    if (!ads || ads.length === 0) return null;
    const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const ad of ads) {
      random -= (ad.weight || 1);
      if (random <= 0) return ad;
    }
    return ads[0];
}

interface AdsManagerProps {
  onFinish?: () => void;
  adTag?: string | null;
}


const AdsManager: React.FC<AdsManagerProps> = ({ onFinish }) => {
  const [ad, setAd] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const { isPremium } = useAuth();

  /**
   * 📡 Fetch & Pick Best Ad (Hybrid Yield)
   */
  const rotateAd = async () => {
    if (isPremium) return;
    
    // Ordered providers (Internal Optimizer first)
    const endpoints = ['/api/ads/next', '/api/ads/vast?provider=google'];

    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(endpoint, { timeout: 3000 });
        const data = res.data;
        
        if (data && (data.ad || data.vastUrl || (Array.isArray(data) && data.length > 0))) {
            let finalAd = data.ad;
            
            // If it's a list, pick weighted
            if (Array.isArray(data)) {
                finalAd = pickWeightedAd(data);
            }

            if (!finalAd && data.vastUrl) {
                finalAd = { id: "vast", title: "Publicité Network", url: data.vastUrl };
            }

            if (finalAd) {
                setAd(finalAd);
                setVisible(true);
                trackAdEvent(finalAd.id, "IMPRESSION");
                
                // Show ad for 15s (Mandatory pre-roll/mid-roll)
                setTimeout(() => {
                    setVisible(false);
                    if (onFinish) onFinish();
                }, 15000);
                
                return;
            }
        }
      } catch (err) {
        console.warn("[AdsManager] Ad fetch failed:", err);
      }
    }
    
    // ✅ FALLBACK: If we went through all endpoints and still have no ad to show,
    // we must call onFinish() immediately to unblock the player.
    console.warn("[AdsManager] No ads available, skipping ad phase.");
    if (onFinish) onFinish();
  };

  const trackAdEvent = async (adId: string, type: string) => {
      try { await axios.post('/api/ads/event', { adId, type }); } catch (e) {}
  };

  useEffect(() => {
    rotateAd(); // Pre-roll
    const interval = setInterval(rotateAd, 120000); // Periodic rotation
    return () => clearInterval(interval);
  }, [isPremium]);

  const handleAdClick = () => {
    if (!ad) return;
    trackAdEvent(ad.id, "CLICK");
    if (ad.url) window.open(ad.url, '_blank');
  };

  if (isPremium || !ad || !visible) return null;

  return (
    <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] bg-black/90 backdrop-blur-3xl rounded-3xl border border-white/10 p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 cursor-pointer animate-in fade-in zoom-in duration-300"
        onClick={handleAdClick}
    >
        <div className="flex gap-5">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden flex-shrink-0 border border-white/10 group">
                {ad.imageUrl ? (
                    <Image src={ad.imageUrl} fill className="object-cover" alt="Ad" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20 font-black uppercase tracking-tighter">AdPRO</div>
                )}
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-white/5">Sponsorisé</span>
                </div>
                <h4 className="text-white font-extrabold text-base truncate tracking-tight">{ad.title || "Explorer INES TV"}</h4>
                <p className="text-white/40 text-[12px] leading-snug line-clamp-2 mt-1">{ad.description || "Inscrivez-vous dès maintenant pour profiter d'une expérience streaming augmentée."}</p>
                
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{ad.platform || "Premium Network"}</span>
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 group/btn hover:bg-emerald-500/20 transition-all">
                        <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">En savoir plus</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Visual Progress Session */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full rounded-b-3xl overflow-hidden">
            <div className="h-full bg-emerald-500 animate-progress origin-left" style={{ animationDuration: '15s' }}></div>
        </div>
    </div>
  );
};

export default AdsManager;
