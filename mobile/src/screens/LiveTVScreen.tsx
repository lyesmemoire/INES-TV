import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import VideoPlayer from '../components/player/VideoPlayer';
import ChannelList from '../components/Channel/ChannelList';
import { parseM3U } from '../services/iptv';
import { usePlayerStore } from '../store/usePlayerStore';

/**
 * 🛰️ LIVE TV SCREEN (Entry Point)
 * Real-time HLS player + Channel selection + Metadata parsing.
 */
export default function LiveTVScreen() {
  const { setChannels } = usePlayerStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        // Using sample public M3U for demo
        const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
        const text = await res.text();

        const channels = parseM3U(text);
        setChannels(channels.slice(0, 100)); // Limit to first 100 for performance demo
      } catch (err) {
        console.error('[LiveTVScreen] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.playerContainer}>
        <VideoPlayer />
      </View>
      <View style={styles.listContainer}>
        <ChannelList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerContainer: {
    height: 240, // standard TV aspect ratio area
    backgroundColor: 'black',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
});
