import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UIProgram } from '../engine/alignment';
import { getWidthFromDuration } from '../engine/layout';

interface ProgramCellProps {
  program: UIProgram;
  isActive?: boolean;
  onPress?: (p: UIProgram) => void;
}

/**
 * 🧱 OPTIMIZED PROGRAM CELL
 * High-performance memoized component for Grid display.
 */
export const ProgramCell = memo(({ program, isActive, onPress }: ProgramCellProps) => {
  const width = getWidthFromDuration(new Date(program.start_time), new Date(program.end_time));
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onPress?.(program)}
      style={[
        styles.container, 
        { width },
        isActive && styles.activeContainer,
        program.is_filler && styles.fillerContainer
      ]}
    >
      <Text style={[styles.title, program.is_filler && styles.fillerText]} numberOfLines={1}>
        {program.title}
      </Text>
      <Text style={styles.time} numberOfLines={1}>
        {new Date(program.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
}, (prev, next) => {
  // Custom memo comparison for extreme scroll performance
  return prev.program.id === next.program.id && prev.isActive === next.isActive;
});

const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
  },
  activeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  fillerContainer: {
    opacity: 0.3,
  },
  title: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fillerText: {
    fontStyle: 'italic',
  },
  time: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#10B981',
  }
});
