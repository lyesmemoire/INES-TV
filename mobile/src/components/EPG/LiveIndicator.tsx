import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useEPGStore } from '../../store/epgStore';
import { TIME_WINDOW } from '../../engine/timeWindow';
import { getWindowRange } from '../../engine/timeWindow';

/**
 * 🔴 LIVE INDICATOR (TiviMate Class)
 * Fast-sync component that moves across the grid every second.
 * Subscribes ONLY to uiTick to avoid triggering layout re-renders.
 */
export default function LiveIndicator() {
  const uiTick = useEPGStore((state) => state.uiTick);
  
  // 📐 Calculate current horizontal offset based on fast clock
  const left = useMemo(() => {
    const { start } = getWindowRange(uiTick);
    const offsetMs = uiTick - start.getTime();
    // (minutes) * pxPerMinute
    return (offsetMs / 60000) * TIME_WINDOW.pxPerMinute;
  }, [uiTick]);

  return (
    <View style={[styles.line, { left: 140 + left }]}>
      <View style={styles.head}>
          <Text style={styles.label}>LIVE</Text>
      </View>
      <View style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 100,
    pointerEvents: 'none',
  },
  head: {
    backgroundColor: '#EF4444', // Red 500
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'center',
    marginLeft: -15,
    top: 50, // Below header
  },
  label: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    backgroundColor: '#EF4444',
    width: 2,
    opacity: 0.8,
  },
});
