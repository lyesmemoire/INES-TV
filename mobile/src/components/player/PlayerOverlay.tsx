import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';

/**
 * FINAL BOSS IPTV: Channel Overlay
 * A premium, glassmorphism overlay for the player.
 */
export default function PlayerOverlay({ channel, visible }: any) {
  if (!channel) return null;

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.container}
        >
          <BlurView intensity={80} style={styles.blur}>
            <View style={styles.content}>
               <View style={styles.badge}>
                  <Text style={styles.badgeText}>LIVE</Text>
               </View>
               <Text style={styles.channelName}>{channel.name}</Text>
               <Text style={styles.category}>{channel.category}</Text>
            </View>
          </BlurView>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blur: {
    padding: 24,
  },
  content: {
    flexDirection: 'column',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  channelName: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  category: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
