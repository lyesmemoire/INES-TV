'use client';

import Script from 'next/script';
import { useAds } from './AdProvider';
import { useDevice } from './useDevice';

/**
 * 📢 SOCIAL BAR COMPONENT
 * Displays a sticky social-bar ad, optimized for mobile RPM.
 */
export const SocialBar = () => {
  const { adblockDetected } = useAds();
  const device = useDevice();

  // Hide if adblock is active
  if (adblockDetected) return null;

  // Optimized for mobile only (best RPM and least desktop UX friction)
  if (device !== 'mobile') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* 
         Replace with your real Adsterra Social Bar script 
      */}
      <Script
        id="adsterra-social-bar"
        src="https://your-adsterra-socialbar.js"
        strategy="lazyOnload"
      />
    </div>
  );
};
