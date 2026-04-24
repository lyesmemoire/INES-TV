import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { UIProgram } from '../engine/alignment';
import { ProgramCell } from './Cell';
import { LAYOUT_CONFIG } from '../engine/layout';

interface ChannelRowProps {
  channel: any;
  programs: UIProgram[];
  onProgramPress?: (p: UIProgram) => void;
}

/**
 * 📺 OPTIMIZED CHANNEL ROW
 * Renders the channel identity and its scrollable timeline.
 */
export const ChannelRow = memo(({ channel, programs, onProgramPress }: ChannelRowProps) => {
  return (
    <View style={styles.container}>
      {/* 🏷️ CHANNEL LABEL (Fixed) */}
      <View style={styles.channelInfo}>
        <Text style={styles.channelName} numberOfLines={1}>{channel.name}</Text>
        <Text style={styles.channelNum}>CH {channel.id.split('-').pop()}</Text>
      </View>

      {/* 🕒 PROGRAM TIMELINE (Horizontal) */}
      <View style={styles.timelineContainer}>
        {programs.map((p, idx) => (
          <ProgramCell 
            key={`${p.id}-${idx}`} 
            program={p} 
            onPress={onProgramPress} 
          />
        ))}
      </View>
    </View>
  );
}, (prev, next) => {
  return prev.channel.id === next.channel.id && prev.programs.length === next.programs.length;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: LAYOUT_CONFIG.ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  channelInfo: {
    width: LAYOUT_CONFIG.CHANNEL_COL_WIDTH,
    backgroundColor: '#161618',
    padding: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#1f1f23',
    zIndex: 10,
  },
  channelName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  channelNum: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  timelineContainer: {
    flexDirection: 'row',
    flex: 1,
  }
});
