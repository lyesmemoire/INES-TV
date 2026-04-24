import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EPGCell } from '../../types/epg';

interface ProgramCellProps {
  cell: EPGCell;
  isFocused?: boolean;
}

/**
 * 📺 LEAN PROGRAM CELL (Operator Grade)
 * Optimized for 60fps TV rendering.
 * Uses Zero-Latency styles and reference-based memoization.
 */
function ProgramCell({ cell, isFocused }: ProgramCellProps) {
  return (
    <View
      style={[
        styles.cell,
        {
          width: cell.width - 4,
          left: cell.left,
          backgroundColor: isFocused 
            ? "#059669" // Vibrant Focus Green
            : (cell.isLive ? "#10B981" : "#1f2937"),
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? "white" : "rgba(255,255,255,0.05)",
        },
        isFocused && styles.focused,
      ]}
    >
      <Text numberOfLines={1} style={[styles.text, isFocused && styles.focusedText]}>
        {cell.program.title}
      </Text>
      <Text numberOfLines={1} style={styles.time}>
        {new Date(cell.program.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

export default React.memo(
  ProgramCell,
  (prev, next) =>
    prev.isFocused === next.isFocused &&
    prev.cell.program.id === next.cell.program.id &&
    prev.cell.left === next.cell.left &&
    prev.cell.width === next.cell.width
);

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    height: 60,
    backgroundColor: '#1f2937', // Gray 800
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
  },
  focused: {
    backgroundColor: '#111827', // Gray 900
    borderWidth: 2,
    borderColor: '#10B981', // Emerald 500
    transform: [{ scale: 1.05 }],
    zIndex: 100,
    // Note: Elevation/Shadows should be used sparingly on TV
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  focusedText: {
    color: '#10B981',
  },
  time: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
  },
});
