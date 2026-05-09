'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AdContextType {
  adblockDetected: boolean;
  setAdblockDetected: (value: boolean) => void;
}

const AdContext = createContext<AdContextType | null>(null);

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [adblockDetected, setAdblockDetected] = useState(false);

  useEffect(() => {
    // 🎣 Bait detection logic
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ad-container';
    bait.style.height = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';

    document.body.appendChild(bait);

    const checkAdblock = () => {
      if (bait.offsetHeight === 0) {
        setAdblockDetected(true);
      }
      bait.remove();
    };

    // Short delay to allow adblockers to act
    const timer = setTimeout(checkAdblock, 800);

    return () => {
      clearTimeout(timer);
      if (bait.parentNode) bait.remove();
    };
  }, []);

  return (
    <AdContext.Provider value={{ adblockDetected, setAdblockDetected }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error('useAds must be used inside AdProvider');
  return context;
};
