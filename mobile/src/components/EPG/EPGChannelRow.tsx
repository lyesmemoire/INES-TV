import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { EPGChannel, EPGProgram, CHANNEL_COL_WIDTH, ROW_HEIGHT } from '../../types/epg';
import EPGProgramCell from './EPGProgramCell';

interface Props {
  channel: EPGChannel;
  programs: EPGProgram[];
  onProgramPress: (program: EPGProgram) => void;
  scrollRef?: any;
}

/**
 * 🛰️ EPG CHANNEL ROW
 * Fixed channel info + Scrollable timeline.
 */
export default function EPGChannelRow({ channel, programs, onProgramPress, scrollRef }: Props) {
  return (
    <View style={styles.container}>
      {/* 📺 CHANNEL FIXED COL */}
      <View style={styles.channelCol}>
        {channel.logo ? (
          <Image source={{ uri: channel.logo }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.placeholderText}>{channel.name[0]}</Text>
          </View>
        )}
        <Text style={styles.channelName} numberOfLines={1}>{channel.name}</Text>
      </View>

      {/* 🕒 PROGRAMS TIMELINE */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
        scrollEnabled={false} // Managed by parent for sync scroll
      >
        {programs.map((program) => (
          <EPGProgramCell
            key={program.id}
            program={program}
            onPress={onProgramPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  channelCol: {
    width: CHANNEL_COL_WIDTH,
    height: '100%',
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#1f1f23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  channelName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
});
