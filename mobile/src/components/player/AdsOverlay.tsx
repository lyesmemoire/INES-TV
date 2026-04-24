import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import {
  fetchDynamicAd,
  reportAdImpression,
  reportDynamicAdClick,
  reportAdClick,
  reportAdSkip,
  type DynamicAdResponse,
} from '../../api/stream';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FAIL_FAST_MS     = 3000;  // Skip to content if no ad loads in 3s
const MANDATORY_SEC    = 5;     // Mandatory watch before skip is enabled

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface AdsOverlayProps {
  onFinish:     () => void;
  isPremium?:   boolean;
  fallbackAds?: DynamicAdResponse[]; // Optional waterfall passed from parent
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 💰 PRO ADS OVERLAY (Phase 60)
 *
 * Flow:
 *   1. Premium user → onFinish() instantly (no render)
 *   2. Fetch single dynamic ad via /api/ads/dynamic (IP-rotated)
 *   3. Fail-fast: if no response in 3s → onFinish()
 *   4. Waterfall fallback: if /dynamic returns null use fallbackAds prop
 *   5. Mandatory 5s view → skip button appears
 *   6. Analytics: impression on mount, click on CTA, skip on skip
 */
export const AdsOverlay: React.FC<AdsOverlayProps> = ({
  onFinish,
  isPremium   = false,
  fallbackAds = [],
}) => {
  const [ad,         setAd]         = useState<DynamicAdResponse | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [countdown,  setCountdown]  = useState(MANDATORY_SEC);
  const [canSkip,    setCanSkip]    = useState(false);

  const finishedRef     = useRef(false);
  const failFastRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const impressionSent  = useRef(false);

  // ── Guard: call onFinish only once ────────────────────────────────────────
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (failFastRef.current)  clearTimeout(failFastRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    onFinish();
  }, [onFinish]);

  // ── Load Ad ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Premium bypass
    if (isPremium) { finish(); return; }

    let cancelled = false;

    const load = async () => {
      // Fail-fast timer
      failFastRef.current = setTimeout(() => {
        if (!cancelled) finish();
      }, FAIL_FAST_MS);

      try {
        let fetched = await fetchDynamicAd();

        if (!fetched && fallbackAds.length > 0) {
          // Waterfall: pick random from fallback list
          fetched = fallbackAds[Math.floor(Math.random() * fallbackAds.length)];
        }

        if (cancelled) return;

        if (!fetched) {
          finish(); // No fill at all
          return;
        }

        clearTimeout(failFastRef.current!); // Ad loaded in time — cancel fail-fast
        setAd(fetched);
        setLoading(false);
      } catch {
        if (!cancelled) finish();
      }
    };

    load();

    return () => {
      cancelled = true;
      if (failFastRef.current)  clearTimeout(failFastRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Impression + Countdown (start when ad is ready) ───────────────────────
  useEffect(() => {
    if (!ad) return;

    // Fire impression once
    if (!impressionSent.current) {
      impressionSent.current = true;
      reportAdImpression(ad.id).catch(() => {});
    }

    // Countdown to skip
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background' && ad) {
        reportAdSkip(ad.id).catch(() => {});
      }
    });

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      subscription.remove();
    };
  }, [ad]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (!ad) return;
    reportDynamicAdClick(ad.provider).catch(() => {});
    reportAdClick(ad.id).catch(() => {});
    Linking.openURL(ad.displayUrl).catch(() => {});
    finish();
  }, [ad, finish]);

  const handleSkip = useCallback(() => {
    if (!ad) return;
    reportAdSkip(ad.id).catch(() => {});
    finish();
  }, [ad, finish]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!ad) return null;

  return (
    <View style={styles.container}>

      {/* AD BADGE */}
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>AD</Text>
      </View>

      {/* AD CONTENT */}
      <View style={styles.content}>
        <Text style={styles.providerLabel}>{ad.provider.toUpperCase()}</Text>
        <Text style={styles.adName}>{ad.name}</Text>
        <Text style={styles.cpmLabel}>Premium Placement</Text>

        {/* CTA BUTTON */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleClick}
          focusable={true}
          {...(Platform.isTV && { hasTVPreferredFocus: !canSkip })}
          accessibilityRole="button"
          accessibilityLabel={`Open ad: ${ad.name}`}
        >
          <Text style={styles.ctaText}>Voir l'offre →</Text>
        </TouchableOpacity>
      </View>

      {/* SKIP BUTTON */}
      <TouchableOpacity
        style={[styles.skipButton, !canSkip && styles.skipDisabled]}
        onPress={canSkip ? handleSkip : undefined}
        disabled={!canSkip}
        focusable={canSkip}
        {...(Platform.isTV && canSkip && { hasTVPreferredFocus: true })}
        accessibilityRole="button"
        accessibilityLabel={canSkip ? 'Skip ad' : `Skip in ${countdown}s`}
      >
        <Text style={[styles.skipText, !canSkip && styles.skipTextDisabled]}>
          {canSkip ? 'Passer ›' : `Passer dans ${countdown}s`}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default AdsOverlay;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent:  'center',
    alignItems:      'center',
    zIndex:          200,
  },

  adBadge: {
    position:          'absolute',
    top:               40,
    left:              20,
    backgroundColor:   'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      4,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.15)',
  },
  adBadgeText: {
    color:       'rgba(255,255,255,0.45)',
    fontSize:    10,
    fontWeight:  '800',
    letterSpacing: 2,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  providerLabel: {
    color:         'rgba(16,185,129,0.85)',
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 3,
    marginBottom:  8,
  },
  adName: {
    color:      '#fff',
    fontSize:   22,
    fontWeight: '700',
    textAlign:  'center',
    marginBottom: 6,
  },
  cpmLabel: {
    color:        'rgba(255,255,255,0.35)',
    fontSize:     12,
    marginBottom: 28,
  },

  ctaButton: {
    backgroundColor:   '#10b981',
    paddingHorizontal: 28,
    paddingVertical:   13,
    borderRadius:      10,
  },
  ctaText: {
    color:      '#000',
    fontWeight: '800',
    fontSize:   15,
  },

  skipButton: {
    position:          'absolute',
    bottom:            40,
    right:             20,
    backgroundColor:   'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderRadius:      8,
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.15)',
  },
  skipDisabled: {
    opacity: 0.4,
  },
  skipText: {
    color:      '#fff',
    fontSize:   13,
    fontWeight: '700',
  },
  skipTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
});
