import { Play, Flame, Star, Volume2, Maximize, AlertTriangle, SkipForward } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from 'next/image';

export default function AdsBanner() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [adData, setAdData] = useState<any>(null);
  const [adBlocked, setAdBlocked] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [adVisible, setAdVisible] = useState(true);

  // Smart Ad Refresh & Anti-AdBlock Logic (Phase 61)
  useEffect(() => {
    const fetchAd = async () => {
      try {
        // Attempt to fetch real ad from our rotating API
        const res = await fetch("/api/ads/next");
        if (!res.ok) throw new Error("AdBlock detected or server error");
        const json = await res.json();
        
        if (json.ad) {
           setAdData(json.ad);
           setAdBlocked(false);
           setSkipAvailable(false); // Reset skip timer for new ad
        } else {
           throw new Error("Empty ad payload");
        }
      } catch (err) {
        console.warn("[Ads] Native Ad blocked or unavailable. Falling back to native sponsor.");
        setAdBlocked(true);
        // Fallback Ad (Server-Side Bypassed)
        setAdData({
           platform: "native",
           title: "INES TV VPN",
           description: "Contournez les restrictions géographiques et protégez votre réseau avec notre VPN intégré.",
           image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2000&auto=format&fit=crop"
        });
      }
    };

    fetchAd();

    // ⏱️ Watch-Time based Ad Refresh (Instead of dumb intervals)
    const timer = setInterval(() => {
        setWatchTime(prev => {
            const nextTime = prev + 1;
            // Refresh ad exactly every 120 seconds of active watch time
            if (nextTime > 0 && nextTime % 120 === 0) {
                 fetchAd();
                 setAdVisible(true);
            }
            // Allow skip after 5 seconds of showing an ad
            if (nextTime % 120 === 5) {
                setSkipAvailable(true);
            }
            return nextTime;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!adVisible || !adData) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded flex items-center gap-1">
            {adBlocked && <AlertTriangle size={10} className="text-amber-500" />}
            {adBlocked ? "Sponsor Natif" : "Sponsorisé"}
            </span>
        </div>
        
        {/* Skip Logic (Boosts CTR by forcing active user choice) */}
        {skipAvailable && (
            <motion.button 
               whileHover={{ scale: 1.05 }}
               onClick={() => setAdVisible(false)}
               className="text-[10px] font-black uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded flex items-center gap-1 transition-colors"
            >
                Ignorer l'annonce <SkipForward size={12} />
            </motion.button>
        )}
        {!skipAvailable && (
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                Vidéo dans {5 - (watchTime % 120)}s...
            </span>
        )}
      </div>

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl group cursor-pointer">
        {/* Placeholder image (representing video ad) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-blue-900/40" />
        <Image 
          src={adData.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"} 
          alt="Ad Content" 
          fill
          className="object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-700"
        />

        {/* Play UI overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 shadow-xl"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Volume2 size={24} /> : <Play size={24} className="ml-1" />}
          </button>
        </div>

        {/* Ad Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500 rounded text-black p-1"><Flame size={12} /></span>
                <div className="flex text-amber-500">
                    <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
                </div>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">{adData.title || "Premium Sponsorship"}</h3>
              <p className="text-sm text-zinc-300 mt-1 max-w-lg">{adData.description || "Discover the latest products from our partners. Performance and quality guaranteed."}</p>
            </div>

            <div className="flex gap-2">
              <button 
                 onClick={() => setAdVisible(false)}
                 className="px-5 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm tracking-wide transition-colors shadow-lg shadow-indigo-500/20"
              >
                Visiter le site
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
