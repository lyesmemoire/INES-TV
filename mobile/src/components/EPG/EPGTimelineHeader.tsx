import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MINUTE_WIDTH } from '../../engine/timeWindow';

interface TimelineHeaderProps {
  windowStart: Date;
}

/**
 * 🕒 EPG TIMELINE HEADER (TiviMate Grade)
 * Displays hourly markers aligned with the grid density.
 * Uses MINUTE_WIDTH=3 for pixel-perfect alignment.
 */
export function TimelineHeader({ windowStart }: TimelineHeaderProps) {
  const hours = [];
  const HOUR_WIDTH = 60 * MINUTE_WIDTH;

  // Render 12 hours of markers starting from the window start
  for (let i = 0; i < 12; i++) {
    const time = new Date(windowStart.getTime() + i * 60 * 60 * 1000);
    const hourLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    hours.push(
      <View key={i} style={[styles.hourMarker, { width: HOUR_WIDTH }]}>
        <Text style={styles.hourText}>{hourLabel}</Text>
        <View style={styles.tick} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.markersRow}>
        {hours}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  spacer: {
    width: 140, // Matches ChannelRow header width
  },
  markersRow: {
    flexDirection: 'row',
  },
  hourMarker: {
    alignItems: 'flex-start',
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    height: '100%',
    justifyContent: 'center',
  },
  hourText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'System',
  },
  tick: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
