import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LAYOUT_CONFIG } from '../engine/layout';

interface TimelineHeaderProps {
  slots: Date[];
}

/**
 * 🕒 EPG TIMELINE HEADER
 * Sticky time indicator for the grid engine.
 */
export const TimelineHeader = memo(({ slots }: TimelineHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* 🏷️ EMPTY CORNER */}
      <View style={styles.corner} />

      {/* ⏱️ TIME SLOTS */}
      <View style={styles.slotsContainer}>
        {slots.map((slot, idx) => (
          <View 
            key={slot.getTime()} 
            style={[
              styles.slot, 
              { width: LAYOUT_CONFIG.PIXELS_PER_MINUTE * 30 }
            ]}
          >
            <Text style={styles.slotText}>
              {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
    zIndex: 100,
  },
  corner: {
    width: LAYOUT_CONFIG.CHANNEL_COL_WIDTH,
    backgroundColor: '#161618',
    borderRightWidth: 1,
    borderRightColor: '#1f1f23',
  },
  slotsContainer: {
    flexDirection: 'row',
  },
  slot: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  slotText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});
