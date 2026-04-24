import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { usePlayerStore } from '../../store/usePlayerStore';

/**
 * 🛰️ ZAP OVERLAY (SaaS Premium)
 * High-fidelity channel info shown during zapping.
 */
export default function ZapOverlay() {
  const { currentChannel, showOverlay } = usePlayerStore();

  if (!currentChannel) return null;

  return (
    <AnimatePresence>
      {showOverlay && (
        <MotiView
          from={{ opacity: 0, translateX: -50 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: -50 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.container}
        >
          <View style={styles.card}>
            {currentChannel.logo ? (
              <Image source={{ uri: currentChannel.logo }} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={[styles.logo, styles.placeholderLogo]}>
                <Text style={styles.placeholderText}>{currentChannel.name[0]}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{currentChannel.name}</Text>
              <Text style={styles.group}>{currentChannel.group || 'Général'}</Text>
            </View>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 40,
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  placeholderLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '900',
  },
  info: {
    marginLeft: 16,
    width: 200,
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  group: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
