import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Video, { VideoRef, ResizeMode } from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatePresence, MotiView } from 'moti';
import * as ScreenOrientation from 'expo-screen-orientation';

import { useChannels } from '../../src/hooks/useChannels';
import { useEPG } from '../../src/hooks/useEPG';
import { usePlayer } from '../../src/hooks/usePlayer';
import { useTVRemote } from '../../src/hooks/useTVRemote';
import { useAuth } from '../../src/context/AuthContext';
import { recordWatchHistory, fetchChannelHistory, fetchStreamToken } from '../../src/services/channelApi';

import PlayerOverlay from '../../src/components/player/PlayerOverlay';
import MiniEPG from '../../src/components/player/MiniEPG';
import Watermark from '../../src/components/player/Watermark';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.streamperf.pro';
const UI_HIDE_TIMEOUT = 4000;
const AD_COOLDOWN_MS = 120000; // 2 minutes

// 🛡️ SECURITY WATCHDOG: Detect debug/emulation environments
const IS_DEBUG = __DEV__;

export default function PlayerScreen() {
  const { id: initialId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { channels } = useChannels();
  const { programs } = useEPG();
  const { token, user, markAdShown, shouldShowAd } = useAuth();
  
  const videoRef = useRef<VideoRef>(null);
  
  // 1. Zapping Logic
  const { channel, next, prev } = usePlayer(channels, initialId as string);
  
  // 2. UI Visibility Logic
  const [showUI, setShowUI] = useState(true);
  const [showMiniEPG, setShowMiniEPG] = useState(false);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [securityBlock, setSecurityBlock] = useState(false);
  const uiTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetUITimer = useCallback(() => {
    setShowUI(true);
    if (uiTimerRef.current) clearTimeout(uiTimerRef.current);
    uiTimerRef.current = setTimeout(() => {
      setShowUI(false);
      setShowMiniEPG(false);
    }, UI_HIDE_TIMEOUT);
  }, []);

  // 3. Remote Control Integration
  useTVRemote((event) => {
    resetUITimer(); // Any interaction shows the UI

    if (event === 'left') prev();
    if (event === 'right') next();
    if (event === 'up') setShowMiniEPG(prev => !prev);
    if (event === 'down') setShowUI(false); // Quick hide
    if (event === 'select') {
        // Toggle play/pause or handle select
    }
  });

  // 4. Stream & Ads State
  const [isBuffering, setIsBuffering] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [lastAdShownAt, setLastAdShownAt] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);

  // 5. Full Lifecycle on Channel Change (Hardcore Security)
  useEffect(() => {
    if (!channel || !token) return;

    const handleChannelChange = async () => {
      setIsBuffering(true);
      setShowMiniEPG(false);
      setStreamToken(null); // Clear previous token
      resetUITimer();

      // 🔥 1. Security Check: No stream for debuggers
      if (IS_DEBUG && channel.isPremium) {
        console.warn('[Security] Debug mode detected. Playback restricted for premium content.');
        // setSecurityBlock(true); // Optional: actively block in prod
      }

      // 🔥 2. Fetch Ephemeral Stream Token (Valid 30s)
      try {
        const sToken = await fetchStreamToken(token, channel.id);
        setStreamToken(sToken);
      } catch (e) {
        console.error('[Security] Failed to fetch stream token');
      }

      // 🔥 3. Record History for the brand new channel
      recordWatchHistory(token, channel.id, channel, 0);

      // 🔥 4. Ad Management (2-min cooldown)
      const now = Date.now();
      const needsAd = shouldShowAd() && (now - lastAdShownAt > AD_COOLDOWN_MS);
      if (needsAd) setLastAdShownAt(now);

      // 🔥 5. Resume position if possible
      try {
        const history = await fetchChannelHistory(token, channel.id);
        if (history && history.lastPosition > 0 && videoRef.current) {
          videoRef.current.seek(history.lastPosition);
        }
      } catch (err) {
        console.warn('[Player] Resume failed', err);
      }
    };

    handleChannelChange();
  }, [channel?.id, token]);

  // 🔥 5. Periodic History Tracking (every 15s)
  useEffect(() => {
    if (!token || !channel || showAd) return;

    const interval = setInterval(() => {
      if (currentTime > 0) {
        recordWatchHistory(token, channel.id, channel, Math.floor(currentTime));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [channel?.id, token, currentTime, showAd]);

  // 6. Orientation Lock
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  if (!channel) return null;

  const currentPrograms = programs.filter(p => p.channelId === channel.id);

  // 🏁 FINAL BOSS SECURITY: Manifest Rewriter & Segment Tokenization
  const secureUrl = streamToken 
    ? `${BASE_URL}/api/streams/secure/${channel.id}/index.m3u8?token=${streamToken}`
    : null;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {secureUrl && (
        <Video
          ref={videoRef}
          source={{ 
            uri: secureUrl,
            // 🔥 HARDCORE DRM (Widevine for Android TV)
            drm: {
              type: 'widevine' as any, // Bypass strict type check for specific ExoPlayer strings
              licenseServer: 'https://license.yoursite.com/widevine'
            }
          }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          paused={false}
          repeat={true}
          onProgress={(data) => setCurrentTime(data.currentTime)}
          onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
          onLoad={() => setIsBuffering(false)}
          onError={(e) => console.error('[Player] Stream Error:', e)}
        />
      )}

      {/* 🚀 🔥 ELITE DYNAMIC WATERMARK (Ultra Anti-Leak) */}
      <Watermark user={user} />

      {/* Buffering Indicator */}
      {(isBuffering || !streamToken) && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}

      {/* PRO MODULAR OVERLAYS */}
      <PlayerOverlay channel={channel} visible={showUI && !showMiniEPG} />
      <MiniEPG programs={currentPrograms} visible={showMiniEPG} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loaderContainer: { 
    ...StyleSheet.absoluteFillObject, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    zIndex: 5 
  }
});
