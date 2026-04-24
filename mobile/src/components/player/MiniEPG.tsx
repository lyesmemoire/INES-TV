import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useEPG } from '../../hooks/useEPG';
import { usePlayerStore } from '../../store/usePlayerStore';

const { width } = Dimensions.get('window');

/**
 * 🛰️ PRO MINI EPG (Staff Engineer Edition)
 * Real-time progress bar, now/next data, and TV-optimized UX.
 */
export default function MiniEPG() {
  const { currentChannel, showOverlay } = usePlayerStore();
  const { data: epgData, isLoading } = useEPG(currentChannel?.name);
  
  const [progress, setProgress] = useState(0);

  // 🔥 Real-time Progress Calculation
  useEffect(() => {
    if (!epgData?.current) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const start = new Date(epgData.current.start_time).getTime();
      const end = new Date(epgData.current.end_time).getTime();
      const now = new Date().getTime();

      const total = end - start;
      const elapsed = now - start;
      const percent = Math.min(Math.max(elapsed / total, 0), 1);
      
      setProgress(percent);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 30000); // 30s sync
    return () => clearInterval(interval);
  }, [epgData?.current]);

  if (!currentChannel) return null;

  return (
    <AnimatePresence>
      {showOverlay && (
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 50 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.container}
        >
          <View style={styles.card}>
            {/* 🕒 TEMPS RÉEL / PROGRESSION */}
            <View style={styles.epgContent}>
              <View style={styles.nowSection}>
                <Text style={styles.label}>EN DIRECT</Text>
                <Text style={styles.programTitle} numberOfLines={1}>
                  {epgData?.current?.title || 'Direct Live'}
                </Text>
                
                {/* 📊 PROGRESS BAR */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
                
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    {epgData?.current ? new Date(epgData.current.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                  <Text style={styles.timeText}>
                    {epgData?.current ? new Date(epgData.current.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                </View>
              </View>

              {/* ➡️ SUIVANT */}
              <View style={styles.divider} />
              
              <View style={styles.nextSection}>
                <Text style={styles.label}>À SUIVRE</Text>
                <Text style={styles.nextTitle} numberOfLines={1}>
                  {epgData?.next?.title || 'À venir...'}
                </Text>
                <Text style={styles.nextTime}>
                  {epgData?.next ? new Date(epgData.next.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
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
    bottom: 40,
    alignSelf: 'center',
    width: width * 0.9,
    zIndex: 100,
  },
  card: {
    backgroundColor: '#09090b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  epgContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowSection: {
    flex: 2,
  },
  nextSection: {
    flex: 1,
    paddingLeft: 20,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  label: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  programTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '700',
  },
  nextTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  nextTime: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '600',
  },
});
