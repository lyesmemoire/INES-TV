import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { useAdStore } from '../../store/useAdStore';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

interface AdOverlayProps {
  onComplete: () => void;
}

/**
 * 🎞️ INTELLIGENT AD RENDERER
 * Fetches yield-optimized VAST tags and handles playback & tracking.
 */
export default function AdOverlay({ onComplete }: AdOverlayProps) {
  const { user } = useAuth();
  const { markAdShown } = useAdStore();
  
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    fetchNextAd();
  }, []);

  const fetchNextAd = async () => {
    try {
      // 🎯 Contact the Intelligence Engine
      const res = await axios.get(`http://YOUR_SERVER_IP:3000/api/ads/next?userId=${user?.id}`);
      if (res.status === 200 && res.data) {
        setAdData(res.data);
        trackEvent(res.data.id, 'impression');
      } else {
        onComplete(); // No ad available, skip
      }
    } catch (err) {
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = (adId: string, type: string) => {
    axios.post('http://YOUR_SERVER_IP:3000/api/ads/track', {
      adId,
      type,
      userId: user?.id
    }).catch(() => {});
  };

  const handleEnd = () => {
    trackEvent(adData.id, 'complete');
    markAdShown();
    onComplete();
  };

  if (loading) return null;
  if (!adData) return null;

  return (
    <View style={styles.container}>
      {/* 📹 AD VIDEO PLAYER */}
      <Video
        source={{ uri: adData.vastUrl }}
        style={styles.adVideo}
        resizeMode="cover"
        onEnd={handleEnd}
        onProgress={({ currentTime }) => {
          const remaining = Math.max(0, 15 - Math.floor(currentTime));
          setSecondsRemaining(remaining);
          if (remaining === 0) setCanSkip(true);
        }}
      />

      {/* 🏷️ AD BADGE */}
      <View style={styles.adBadge}>
        <Text style={styles.adText}>PUBLICITÉ</Text>
      </View>

      {/* ⏭️ SKIP BUTTON / TIMER */}
      <View style={styles.skipContainer}>
        {adData.isSkippable && canSkip ? (
          <TouchableOpacity style={styles.skipButton} onPress={handleEnd}>
            <Text style={styles.skipText}>PASSER L'ANNONCE ›</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>L'annonce se termine dans {secondsRemaining}s</Text>
          </View>
        )}
      </View>
      
      {/* 🔗 CLICK THROUGH (Optional) */}
      <TouchableOpacity 
        style={styles.learnMore} 
        onPress={() => trackEvent(adData.id, 'click')}
      >
        <Text style={styles.learnMoreText}>EN SAVOIR PLUS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black', zIndex: 1000 },
  adVideo: { flex: 1 },
  adBadge: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  skipContainer: {
    position: 'absolute',
    bottom: 60,
    right: 0,
  },
  skipButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  timerBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    marginRight: 20,
    borderRadius: 8,
  },
  timerText: { color: 'white', fontSize: 12 },
  learnMore: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  learnMoreText: { color: 'black', fontWeight: 'bold' },
});
