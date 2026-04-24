import React, { useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TimelineHeader } from './TimelineHeader';
import { ChannelRow } from './Row';
import { LAYOUT_CONFIG, getOffsetFromStart } from '../engine/layout';
import { getTimeSlots } from '../engine/timeWindow';
import { useEPGStore } from '../../../store/epgStore';

interface EPGGridProps {
  channels: any[];
  onProgramPress?: (p: any) => void;
}

/**
 * 🛰️ MASTER EPG GRID ENGINE
 * Coordinates synchronized horizontal scrolling and vertical virtualization.
 */
export function EPGGrid({ channels, onProgramPress }: EPGGridProps) {
  const { data, visibleWindow } = useEPGStore();
  const timeSlots = useMemo(() => getTimeSlots(visibleWindow.start, visibleWindow.end), [visibleWindow]);
  
  // Real-time indicator position
  const nowOffset = useMemo(() => 
    getOffsetFromStart(visibleWindow.start, new Date()), 
    [visibleWindow.start]
  );

  return (
    <View style={styles.container}>
      {/* ↔️ SINGLE HORIZONTAL WRAPPER (Sync Layer) */}
      <ScrollView horizontal bounces={false} style={styles.horizontalScroll}>
        <View>
          {/* ⏱️ STICKY TIME HEADER */}
          <TimelineHeader slots={timeSlots} />

          {/* ↕️ VERTICAL VIRTUALIZATION (Scale Layer) */}
          <View style={{ height: 600, width: (timeSlots.length * 30 * LAYOUT_CONFIG.PIXELS_PER_MINUTE) + LAYOUT_CONFIG.CHANNEL_COL_WIDTH }}>
            <FlashList
              data={channels}
              keyExtractor={(item) => item.id}
              estimatedItemSize={LAYOUT_CONFIG.ROW_HEIGHT}
              renderItem={({ item }) => (
                <ChannelRow 
                  channel={item} 
                  programs={data[item.name] || []}
                  onProgramPress={onProgramPress}
                />
              )}
            />
          </View>

          {/* 🔴 LIVE INDICATOR LINE */}
          <View 
            style={[
              styles.liveIndicator, 
              { left: LAYOUT_CONFIG.CHANNEL_COL_WIDTH + nowOffset }
            ]} 
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  horizontalScroll: {
    flex: 1,
  },
  liveIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
    zIndex: 200,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  }
});
