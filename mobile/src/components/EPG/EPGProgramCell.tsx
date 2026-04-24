import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { EPGProgram, PIXELS_PER_MINUTE } from '../../types/epg';

interface Props {
  program: EPGProgram;
  onPress: (program: EPGProgram) => void;
}

/**
 * 🛰️ EPG PROGRAM CELL (Premium UI)
 * Dynamic width based on duration + Focus Highlight.
 */
export default function EPGProgramCell({ program, onPress }: Props) {
  const start = new Date(program.start_time).getTime();
  const end = new Date(program.end_time).getTime();
  const durationMinutes = (end - start) / 1000 / 60;
  
  const cellWidth = Math.max(durationMinutes * PIXELS_PER_MINUTE - 2, 80); // Min width for tiny programs

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(program)}
      style={[styles.container, { width: cellWidth }]}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {program.title}
        </Text>
        <Text style={styles.time} numberOfLines={1}>
          {new Date(program.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    backgroundColor: '#1f1f23',
    marginRight: 2,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  time: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'bold',
  },
});
