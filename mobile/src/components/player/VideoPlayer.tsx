import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useUserStore } from '../../store/useUserStore';
import { useAuth } from '../../../context/AuthContext';
import { useAdStore } from '../../store/useAdStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useTVRemote } from '../../hooks/useTVRemote';
import ZapOverlay from './ZapOverlay';
import MiniEPG from './MiniEPG';
import AdOverlay from './AdOverlay';

export default function VideoPlayer() {
  const playerRef = useRef<VideoRef>(null);

  const {
    currentChannel,
    nextChannel,
    prevChannel,
    showOverlay,
  } = usePlayerStore();

  const { addRecentChannel } = useUserStore();
  const { user } = useAuth();
  const { activeProfile } = useProfileStore();
  const { shouldShowAd, incrementZapCount } = useAdStore();

  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);
  const [historyTimer, setHistoryTimer] = useState<NodeJS.Timeout | null>(null);

  const resetHideTimer = () => {
    if (hideTimer) clearTimeout(hideTimer);
    const timer = setTimeout(() => {
      if (usePlayerStore.getState().showOverlay) {
        usePlayerStore.setState({ showOverlay: false });
      }
    }, 5000);
    setHideTimer(timer);
  };

  useEffect(() => {
    if (currentChannel?.url) {
      setLoading(true);
      if (historyTimer) clearTimeout(historyTimer);

      if (user && activeProfile) {
        const timer = setTimeout(() => {
          addRecentChannel(user.id, activeProfile.id, currentChannel.id);
        }, 5000);
        setHistoryTimer(timer);
      }

      // 🧠 INTELLIGENT AD TRIGGER
      incrementZapCount();
      if (shouldShowAd()) {
        setShowAd(true);
        useAdStore.setState({ isAdPlaying: true });
      }

      usePlayerStore.setState({ showOverlay: true });
      resetHideTimer();
    }
  }, [currentChannel]);

  // 🎮 TV REMOTE NAVIGATION
  useTVRemote((eventType) => {
    if (showAd) return;
    
    if (eventType === 'right') {
        nextChannel();
        resetHideTimer();
    }
    else if (eventType === 'left') {
        prevChannel();
        resetHideTimer();
    }
    else if (eventType === 'select' || eventType === 'center') {
        usePlayerStore.setState({ showOverlay: !usePlayerStore.getState().showOverlay });
        if (!usePlayerStore.getState().showOverlay) resetHideTimer();
    }
  });

  if (!currentChannel) return null;

  return (
    <View style={styles.container}>
      <Video
        ref={playerRef}
        source={{ uri: currentChannel.url }}
        style={styles.video}
        resizeMode="contain"
        controls={false}
        paused={showAd}
        bufferConfig={{
          minBufferMs: 10000,
          maxBufferMs: 40000,
          bufferForPlaybackMs: 2000,
          bufferForPlaybackAfterRebufferMs: 4000,
        }}
        onLoad={() => setLoading(false)}
        onBuffer={({ isBuffering }) => setLoading(isBuffering)}
        playInBackground={true}
        ignoreSilentSwitch="ignore"
      />

      {showAd && <AdOverlay onComplete={() => setShowAd(false)} />}

      {loading && !showAd && (
        <View style={styles.centerOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}

      <ZapOverlay />
      <MiniEPG />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
