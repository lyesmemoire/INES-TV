import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

/**
 * PRODUCTION READY DYNAMIC WATERMARK
 * Randomized movement every 10 seconds to prevent removal and trace leaks.
 */
export default function Watermark({ user }: any) {
  const [pos, setPos] = useState({ top: 100, left: 100, rotate: '-15deg' });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({
        top: 50 + Math.random() * 300,
        left: 50 + Math.random() * 400,
        rotate: `${Math.random() * 40 - 20}deg`
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <MotiView
        animate={{ 
          opacity: 0.15,
          top: pos.top,
          left: pos.left,
          rotate: pos.rotate
        }}
        transition={{ type: 'timing', duration: 2000 }}
        style={styles.container}
      >
        <Text style={styles.text} numberOfLines={1}>
          {user.id?.substring(0, 8)} | {user.email} | {new Date().toISOString()}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 10,
  },
  text: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
