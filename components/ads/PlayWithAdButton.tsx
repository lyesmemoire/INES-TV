'use client';
// Cache buster: 1714846440
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Play } from 'lucide-react';
import { GlobalAdManager } from '@/lib/ads/ad-manager';
import { AdProvider } from '@/lib/ads/service';

interface PlayWithAdButtonProps {
  onPlayAction?: () => void;
  lang?: string;
}

export const PlayWithAdButton = (props: PlayWithAdButtonProps) => {
  const onPlayAction = props?.onPlayAction;
  const lang = props?.lang || 'fr';
  const [activeProviders, setActiveProviders] = useState<AdProvider[]>([]);
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    // Basic device detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setDevice(isMobile ? 'mobile' : 'desktop');
  }, []);

  const handleClick = async () => {
    // 🌍 Initialize Global Ad Manager
    // In prod, detect country via header or API. Here we use 'FR' as default/demo.
    const adManager = new GlobalAdManager('FR', device);
    
    try {
      const eligible = await adManager.getEligibleProviders();

      if (eligible.length > 0) {
        console.log(`[Ads] Industrial Multi-Regie: injecting ${eligible.length} providers`);
        
        setActiveProviders(eligible);
        
        // Register impressions for all injected scripts
        for (const provider of eligible) {
          adManager.registerImpression(provider);
        }
      }
    } catch (err) {
      console.error('[Ads] Error in AdManager:', err);
    }

    if (typeof onPlayAction === 'function') onPlayAction();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="group relative flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-red-600/20 active:scale-95"
      >
        <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
          <Play size={16} fill="currentColor" />
        </div>
        {lang === 'fr' ? 'Regarder le match' : 'Watch the match'}
      </button>

      {activeProviders.map((provider) => (
        <Script
          key={provider.id}
          id={`ad-script-${provider.id}`}
          src={provider.script_url}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
};
