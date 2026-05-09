'use client';

import { useEffect, useRef, useState } from 'react';
import { useAds } from './AdProvider';

declare global {
  interface Window {
    __adsLoaded?: boolean;
  }
}

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'in-content' | 'footer' | 'hero-bottom';
  id?: string;
  className?: string;
}

const PLACEMENT_HEIGHTS = {
  'header': 'h-[90px]',
  'hero-bottom': 'h-[90px]',
  'in-content': 'h-[250px]',
  'sidebar': 'h-[600px]',
  'footer': 'h-[90px]'
};

export const AdSlot = ({ placement, id, className }: AdSlotProps) => {
  const { adblockDetected } = useAds();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotId = id || `ad-slot-${placement}-${Math.random().toString(36).substr(2, 5)}`;

  useEffect(() => {
    if (adblockDetected || !containerRef.current) return;

    // 🕵️ Lazy Load Observer (Performance & SEO)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load earlier to avoid white flash
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [adblockDetected]);

  // 📵 Mobile Protection: Hide header ads on mobile to avoid Google penalties
  const isMobileHeader = placement === 'header';

  useEffect(() => {
    if (!isVisible || adblockDetected) return;

    // 🚀 Centralized Loader (Single Source of Truth)
    if (!window.__adsLoaded) {
      const script = document.createElement('script');
      script.src = "https://secure-ad-network.com/main.js"; // Replace with real provider
      script.async = true;
      script.defer = true;
      script.dataset.goalaAdLoader = "true";
      document.body.appendChild(script);
      window.__adsLoaded = true;
    }

    // 🛠️ Slot Initialization (Provider specific)
    console.log(`[ADS] Initializing slot ${slotId} for ${placement}`);
  }, [isVisible, adblockDetected, slotId, placement]);

  if (adblockDetected) {
    return (
      <div className={`ad-placeholder ${PLACEMENT_HEIGHTS[placement]} bg-zinc-900/20 border border-white/5 rounded-xl flex items-center justify-center italic text-zinc-600 text-xs uppercase tracking-widest ${className}`}>
        Support GOALA by disabling Adblock
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      id={slotId}
      className={`ad-slot-wrapper ${PLACEMENT_HEIGHTS[placement]} w-full flex justify-center items-center bg-white/5 rounded-xl border border-dashed border-white/10 transition-colors overflow-hidden ${isMobileHeader ? 'hidden md:flex' : 'flex'} ${className}`}
    >
      {!isVisible && (
        <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest animate-pulse">
          Loading AD...
        </span>
      )}
    </div>
  );
};
