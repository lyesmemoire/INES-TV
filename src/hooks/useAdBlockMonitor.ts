import { useState, useEffect, useCallback } from 'react';

const STRIKES_KEY = 'streamperf_ab_strikes';
const LAST_STRIKE_KEY = 'streamperf_ab_last';
const MAX_STRIKES = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minute

export const useAdBlockMonitor = () => {
  const [strikes, setStrikes] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Initial load from localStorage
    const savedStrikes = parseInt(localStorage.getItem(STRIKES_KEY) || '0', 10);
    setStrikes(savedStrikes);
    if (savedStrikes >= MAX_STRIKES) {
      setIsBlocked(true);
    }
  }, []);

  // Live Auto-Detection to unblock instantly
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBlocked) {
      interval = setInterval(() => {
        const adTest = document.createElement('div');
        adTest.className = 'ad-banner adsbox ad-slot center-block-ad';
        adTest.style.position = 'absolute';
        adTest.style.left = '-9999px';
        adTest.style.height = '10px';
        document.body.appendChild(adTest);
        
        setTimeout(() => {
          const isAdBlocked = adTest.offsetHeight === 0;
          document.body.removeChild(adTest);
          
          if (!isAdBlocked) {
            // AdBlock was disabled! Unseal the player.
            setIsBlocked(false);
            setStrikes(0);
            localStorage.setItem(STRIKES_KEY, '0');
          }
        }, 50);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isBlocked]);

  const registerStrike = useCallback(() => {
    const now = Date.now();
    const lastStrike = parseInt(localStorage.getItem(LAST_STRIKE_KEY) || '0', 10);
    const currentStrikes = parseInt(localStorage.getItem(STRIKES_KEY) || '0', 10);

    // If completely blocked, enforce it
    if (currentStrikes >= MAX_STRIKES) {
      setIsBlocked(true);
      return;
    }

    // Check if cooldown has passed
    if (now - lastStrike >= COOLDOWN_MS) {
      const newStrikes = currentStrikes + 1;
      localStorage.setItem(STRIKES_KEY, newStrikes.toString());
      localStorage.setItem(LAST_STRIKE_KEY, now.toString());
      setStrikes(newStrikes);

      if (newStrikes >= MAX_STRIKES) {
        setIsBlocked(true);
        setShowWarning(false);
      } else {
        setShowWarning(true);
        // Hide warning automatically after 10 seconds
        setTimeout(() => setShowWarning(false), 10000);
      }
    } else {
      // Still in cooldown, but user triggered it again. 
      // We don't augment the strike count, but if they are close to block, reshow warning
      if (currentStrikes > 0 && currentStrikes < MAX_STRIKES) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 10000);
      }
    }
  }, []);

  const resetWarning = () => setShowWarning(false);

  return {
    strikes,
    isBlocked,
    showWarning,
    registerStrike,
    resetWarning,
    maxStrikes: MAX_STRIKES,
  };
};
