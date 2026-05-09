import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
    __IMA_GLOBAL_MANAGER__?: {
      adsLoader: any;
      adsManager: any;
      container: any;
      containerInitialized: boolean;
      isInitializing: boolean;
    };
  }
}

/**
 * useGoogleIMA
 *
 * Integrates Google IMA SDK for in-stream ad playback.
 *
 * CRITICAL FIX: `AdDisplayContainer.initialize()` MUST be called inside
 * a user-gesture handler (click/touch). Calling it outside one causes the
 * "new OV" error in ima3.js. We split init into two phases:
 *   Phase 1 (mount)  – create loader, request ads, DO NOT call initialize()
 *   Phase 2 (gesture) – on first user click, call initialize() then start()
 */
export const useGoogleIMA = (
  videoRef: React.RefObject<HTMLVideoElement>,
  isPremium: boolean,
  onAdBlockDetected?: () => void
) => {
  const initializedRef = useRef<boolean>(false);
  const gestureHandlerRef = useRef<((e: Event) => void) | null>(null);

  useEffect(() => {
    // Skip for premium users
    if (isPremium) return;

    // ── Phase 1: Setup (no user gesture required) ──────────────────────────
    const setupIMA = async () => {
      if (initializedRef.current) return;
      if (window.__IMA_GLOBAL_MANAGER__?.isInitializing) return;

      // Destroy any stale instance
      destroyIMA();

      window.__IMA_GLOBAL_MANAGER__ = {
        adsLoader: null,
        adsManager: null,
        container: null,
        containerInitialized: false,
        isInitializing: true,
      };

      // Small delay to ensure DOM is stable
      await new Promise(r => setTimeout(r, 200));

      const video = videoRef.current;
      const adElement = document.getElementById("ad-container");

      if (!video || !adElement) {
        if (window.__IMA_GLOBAL_MANAGER__) {
          window.__IMA_GLOBAL_MANAGER__.isInitializing = false;
        }
        return;
      }

      // AdBlock check
      if (!window.google?.ima) {
        console.warn("[IMA] AdBlock detected or SDK not loaded.");
        if (onAdBlockDetected) onAdBlockDetected();
        if (window.__IMA_GLOBAL_MANAGER__) {
          window.__IMA_GLOBAL_MANAGER__.isInitializing = false;
        }
        return;
      }

      try {
        // Create the container but DO NOT call initialize() here
        // (requires user gesture — see Phase 2)
        const container = new window.google.ima.AdDisplayContainer(adElement, video);
        window.__IMA_GLOBAL_MANAGER__!.container = container;

        // Create ads loader
        const adsLoader = new window.google.ima.AdsLoader(container);
        window.__IMA_GLOBAL_MANAGER__!.adsLoader = adsLoader;

        // ── Ads Manager Loaded ──
        adsLoader.addEventListener(
          window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (event: any) => {
            const manager = event.getAdsManager(video);
            if (!window.__IMA_GLOBAL_MANAGER__) return;
            window.__IMA_GLOBAL_MANAGER__.adsManager = manager;

            // Track ad events
            const track = (name: string) => {
              fetch(`${window.location.origin}/api/ads/track/IMA/${name.toLowerCase()}`, {
                method: 'GET',
                keepalive: true,
              }).catch(() => {});
            };

            manager.addEventListener(window.google.ima.AdEvent.Type.STARTED, () => track('START'));
            manager.addEventListener(window.google.ima.AdEvent.Type.IMPRESSION, () => track('IMPRESSION'));
            manager.addEventListener(window.google.ima.AdEvent.Type.COMPLETE, () => track('COMPLETE'));
            manager.addEventListener(window.google.ima.AdEvent.Type.SKIPPED, () => track('SKIP'));
            manager.addEventListener(window.google.ima.AdEvent.Type.CLICK, () => track('CLICK'));

            manager.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, (e: any) => {
              console.warn("[IMA] Manager error:", e.getError?.()?.getMessage?.() ?? e);
              track('ERROR');
            });

            // Phase 2 is triggered by the user clicking the player
          }
        );

        // ── Loader level errors ──
        adsLoader.addEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          (e: any) => {
            console.warn("[IMA] Loader error (non-fatal):", e.getError?.()?.getMessage?.() ?? e);
          }
        );

        // ── Build VAST request ──
        const adUnitCode = "INES TV_video_instream";
        let biddingKeywords: string[] = [];
        try {
          const { initHeaderBidding } = await import("./useHeaderBidding.js");
          biddingKeywords = await initHeaderBidding(adUnitCode, 1000);
        } catch {
          // Header bidding is optional; fall through silently
        }

        const request = new window.google.ima.AdsRequest();
        const baseUrl = `${window.location.origin}/api/ads/vast`;
        const bidParams = biddingKeywords.length > 0 ? `&${biddingKeywords.join('&')}` : '';
        request.adTagUrl = `${baseUrl}?ad_unit=${adUnitCode}${bidParams}`;

        adsLoader.requestAds(request);

        initializedRef.current = true;
        window.__IMA_GLOBAL_MANAGER__!.isInitializing = false;
        console.log("[IMA] Setup complete. Waiting for user gesture to start ads.");

        // ── Phase 2: Register gesture handler ──────────────────────────────
        const onUserGesture = () => {
          const g = window.__IMA_GLOBAL_MANAGER__;
          if (!g?.container || !g?.adsManager || g.containerInitialized) return;

          try {
            // MUST be called inside a user gesture
            g.container.initialize();
            g.containerInitialized = true;

            const v = videoRef.current;
            if (!v) return;

            g.adsManager.init(v.offsetWidth || 1280, v.offsetHeight || 720, window.google.ima.ViewMode.NORMAL);
            g.adsManager.start();
            console.log("[IMA] Ads started after user gesture.");
          } catch (err) {
            console.warn("[IMA] Could not start ads on gesture:", err);
          }

          // Cleanup gesture listeners
          document.removeEventListener('click', onUserGesture);
          document.removeEventListener('touchstart', onUserGesture);
          gestureHandlerRef.current = null;
        };

        gestureHandlerRef.current = onUserGesture;
        document.addEventListener('click', onUserGesture, { once: true });
        document.addEventListener('touchstart', onUserGesture, { once: true });

      } catch (err) {
        console.error("[IMA] Critical failure during setup:", err);
        destroyIMA();
      }
    };

    setupIMA();

    // Refresh ads every 15 minutes
    const interval = setInterval(() => {
      initializedRef.current = false;
      destroyIMA();
      setupIMA();
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
      // Remove gesture handlers on unmount
      if (gestureHandlerRef.current) {
        document.removeEventListener('click', gestureHandlerRef.current);
        document.removeEventListener('touchstart', gestureHandlerRef.current);
        gestureHandlerRef.current = null;
      }
      initializedRef.current = false;
      destroyIMA();
    };
  }, [videoRef, isPremium, onAdBlockDetected]);
};

/** Safely destroys an existing IMA instance without throwing. */
function destroyIMA() {
  const g = window.__IMA_GLOBAL_MANAGER__;
  if (!g) return;
  try { if (g.adsManager) g.adsManager.destroy(); } catch {}
  try { if (g.adsLoader) g.adsLoader.contentComplete(); } catch {}
  try { if (g.container) g.container.destroy(); } catch {}
  window.__IMA_GLOBAL_MANAGER__ = undefined;
}
