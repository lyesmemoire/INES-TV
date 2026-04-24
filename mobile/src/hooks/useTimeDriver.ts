import { useEffect } from 'react';
import { useEPGStore } from '../store/epgStore';

/**
 * ⏱️ GLOBAL TIME ENGINE (Staff Level)
 * Centralized metronome for the EPG Grid.
 * DYNAMIC DUAL CLOCK:
 * - FAST (1s): Smooth UI indicators
 * - SLOW (15s): Logic & Layout sync
 */
export function useTimeDriver() {
  const { setLivePointer, setUITick } = useEPGStore();

  useEffect(() => {
    // Initial sync
    const start = Date.now();
    setLivePointer(start);
    setUITick(start);

    // ── 🔴 FAST UI CLOCK (Every 1s) ──────────────────────────────────────────
    const uiInterval = setInterval(() => {
      setUITick(Date.now());
    }, 1000);

    // ── ⚙️ SLOW LOGIC CLOCK (Every 15s) ────────────────────────────────────────
    const logicInterval = setInterval(() => {
      const now = Date.now();
      console.log(`\x1b[36m[EPG Ticker]\x1b[0m Syncing Logic Pointer: ${new Date(now).toLocaleTimeString()}`);
      setLivePointer(now);
    }, 15000);

    return () => {
      clearInterval(uiInterval);
      clearInterval(logicInterval);
    };
  }, [setLivePointer, setUITick]);
}
