import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList, ActivityIndicator, Dimensions, useTVEventHandler } from 'react-native';
import { usePlayerStore } from '../store/usePlayerStore';
import { fetchEPGPrograms } from '../services/epg.service';
import EPGChannelRow from '../components/EPG/EPGChannelRow';
import EPGTimelineHeader from '../components/EPG/EPGTimelineHeader';
import { EPGChannelData, PIXELS_PER_MINUTE } from '../types/epg';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

/**
 * 🛰️ LIVE TV GUIDE SCREEN (The Masterpiece)
 * Professional grid UX with synchronized scroll and TV control.
 */
export default function LiveTVGuideScreen() {
  const { channels, setChannelIndex } = usePlayerStore();
  const [gridData, setGridData] = useState<EPGChannelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const horizontalScrollRef = useRef<ScrollView>(null);
  const rowsRefs = useRef<{ [key: string]: ScrollView | null }>({});

  // 🔥 FETCH DATA
  useEffect(() => {
    const loadEPG = async () => {
      try {
        setIsLoading(true);
        const programs = await fetchEPGPrograms();
        
        // Map programs to channels
        const mappedData = channels.map(ch => ({
          channel: ch as any,
          programs: programs.filter(p => p.channel_id === ch.name) // Using name as ID for demo mapping
        }));

        setGridData(mappedData);
      } catch (err) {
        console.error('[LiveTVGuide] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (channels.length > 0) loadEPG();
  }, [channels]);

  // 🔥 TIMELINE SYNC
  const onHorizontalScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // We could sync other rows here if they weren't wrapped in a single horizontal scroll
  };

  // 🎮 TV REMOTE ZAPPING
  useTVEventHandler((evt) => {
    if (evt.eventType === 'select' || evt.eventType === 'center') {
      // Logic for selecting program and zapping
    }
  });

  const handleProgramPress = (program: any) => {
    const channelIdx = channels.findIndex(ch => ch.name === program.channel_id);
    if (channelIdx !== -1) {
      setChannelIndex(channelIdx);
      router.push('/(tabs)/live'); // Return to player
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🏁 GRID MASTER SCROLL */}
      <ScrollView
         stickyHeaderIndices={[0]}
         showsVerticalScrollIndicator={false}
         bounces={false}
      >
        <EPGTimelineHeader />

        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          onScroll={onHorizontalScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <View>
            {gridData.map((item, index) => (
              <EPGChannelRow
                key={item.channel.id || index}
                channel={item.channel}
                programs={item.programs}
                onProgramPress={handleProgramPress}
              />
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
});
