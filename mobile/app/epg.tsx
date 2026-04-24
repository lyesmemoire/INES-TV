import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Search, Calendar, Star, Clock, List } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChannels } from '../src/hooks/useChannels';
import { useTimeDriver } from '../src/hooks/useTimeDriver';
import { useEPGGrid } from '../src/hooks/useEPGGrid';
import ChannelRow from '../src/components/EPG/ChannelRow';
import { TimelineHeader } from '../src/components/EPG/EPGTimelineHeader';
import LiveIndicator from '../src/components/EPG/LiveIndicator';
import { useEPGFocusStore } from '../src/store/epgFocusStore';
import { useUserStore } from '../src/store/useUserStore';
import { usePrioritizedChannels } from '../src/hooks/usePrioritizedChannels';
import useTVEventHandler from '../src/hooks/useTVEventHandler';
import { snapToProgram, throttleRemote } from '../src/engine/focusEngine';
import { ensureVisibleX, ensureVisibleY } from '../src/engine/scrollUtils';
import { getTimeWindow, timeToPosition } from '../src/engine/timeWindow';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWPORT_WIDTH = SCREEN_WIDTH - 140; 
const STEP = 30 * 60 * 1000; // 30 min jumps

export default function EPGScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { toggleFavorite, isFavorite, addRecent } = useUserStore();
  
  useTimeDriver();

  const { start: windowStart } = useMemo(() => getTimeWindow(), []);

  const { channels, isLoading: channelsLoading } = useChannels();
  const { favorites, recents, all } = usePrioritizedChannels(channels);

  const displayList = useMemo(() => {
    const list: any[] = [];
    if (favorites.length > 0) {
      list.push({ type: 'header', title: 'FAVORIS', icon: Star, color: '#FBBF24' });
      favorites.forEach(c => list.push({ type: 'channel', data: c, isFavorite: true }));
    }
    if (recents.length > 0) {
      list.push({ type: 'header', title: 'RÉCENTS', icon: Clock, color: '#10B981' });
      recents.forEach(c => list.push({ type: 'channel', data: c, isFavorite: isFavorite(c.id) }));
    }
    if (all.length > 0) {
      list.push({ type: 'header', title: 'TOUTES LES CHAÎNES', icon: List, color: 'rgba(255,255,255,0.4)' });
      all.forEach(c => list.push({ type: 'channel', data: c, isFavorite: false }));
    }
    return list;
  }, [favorites, recents, all, isFavorite]);

  const channelIds = useMemo(() => channels.map(c => c.id), [channels]);
  const { data: epgData, isLoading: epgLoading } = useEPGGrid(channelIds);

  const focus = useEPGFocusStore();

  // 🎮 TV UX NAVIGATION ENGINE (TiviMate Level)
  useTVEventHandler(throttleRemote((evt) => {
    if (!evt || !evt.eventType || channelsLoading || displayList.length === 0) return;

    let newTime = focus.focusedTime;
    let newChannelIndex = focus.focusedChannelIndex;

    const event = evt.eventType;

    if (event === 'right') {
      newTime += STEP;
    } else if (event === 'left') {
      newTime -= STEP;
    } else if (event === 'down') {
        let nextIdx = focus.focusedChannelIndex + 1;
        while (nextIdx < displayList.length && displayList[nextIdx].type === 'header') nextIdx++;
        newChannelIndex = Math.min(displayList.length - 1, nextIdx);
    } else if (event === 'up') {
        let nextIdx = focus.focusedChannelIndex - 1;
        while (nextIdx >= 0 && displayList[nextIdx].type === 'header') nextIdx--;
        newChannelIndex = Math.max(0, nextIdx);
    } else if (event === 'select' || event === 'center') {
      const activeItem = displayList[focus.focusedChannelIndex];
      if (activeItem?.type === 'channel') {
        addRecent(activeItem.data.id);
        router.push(`/player/${activeItem.data.id}`);
      }
      return;
    } else if (event === 'play' || event === 'yellow') {
        const activeItem = displayList[focus.focusedChannelIndex];
        if (activeItem?.type === 'channel') toggleFavorite(activeItem.data.id);
        return;
    }

    const activeItem = displayList[newChannelIndex];
    if (activeItem?.type === 'channel') {
        const activeChannel = activeItem.data;
        const programs = epgData?.[activeChannel.id] || [];
        const snappedTime = snapToProgram(newTime, programs);
        
        // 🧩 Smart Centering Logic
        const x = timeToPosition(new Date(snappedTime), windowStart);
        const y = newChannelIndex * 80; // Approximate Row Height

        const nextScrollX = ensureVisibleX(x, VIEWPORT_WIDTH, focus.scrollX);
        const nextScrollY = ensureVisibleY(y, SCREEN_HEIGHT - 100, focus.scrollY);

        if (nextScrollX !== null || nextScrollY !== null) {
            scrollRef.current?.scrollTo({ 
                x: nextScrollX ?? focus.scrollX, 
                y: nextScrollY ?? focus.scrollY, 
                animated: true 
            });
            focus.setFocus({ 
                scrollX: nextScrollX ?? focus.scrollX,
                scrollY: nextScrollY ?? focus.scrollY
            });
        }

        focus.setFocus({
            focusedChannelIndex: newChannelIndex,
            focusedChannelId: activeChannel.id,
            focusedTime: snappedTime,
            focusedProgramId: programs.find(p => {
                const ps = new Date(p.start_time).getTime();
                const pe = new Date(p.end_time).getTime();
                return snappedTime >= ps && snappedTime < pe;
            })?.id || null,
        });
    }
  }));

  const isLoading = (channelsLoading || epgLoading) && channels.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Guide TV Pro</Text>
        <View style={styles.headerActions}>
          <Search color="white" size={20} style={styles.actionIcon} />
          <Calendar color="#10B981" size={20} />
        </View>
      </View>

      <View style={styles.gridContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Calibrage du moteur TiviMate...</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView 
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
                <View style={{ flex: 1 }}>
                    <TimelineHeader windowStart={windowStart} />
                    <LiveIndicator />
                    <ScrollView 
                        style={styles.gridContents}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        {displayList.map((item, idx) => {
                            if (item.type === 'header') {
                                const Icon = item.icon;
                                return (
                                    <View key={`header-${idx}`} style={styles.sectionHeader}>
                                        <Icon size={14} color={item.color} style={{ marginRight: 8 }} />
                                        <Text style={[styles.sectionTitle, { color: item.color }]}>{item.title}</Text>
                                        <View style={[styles.sectionLine, { backgroundColor: item.color, opacity: 0.1 }]} />
                                    </View>
                                );
                            }
                            return (
                                <View 
                                    key={item.data.id} 
                                    style={[
                                        styles.rowWrapper,
                                        focus.channelIndex === idx && styles.selectedRow
                                    ]}
                                >
                                    <ChannelRow 
                                        channel={item.data} 
                                        cells={epgData?.[item.data.id] || []} 
                                        windowStart={windowStart}
                                        isFavorite={item.isFavorite}
                                        focusedProgramId={focus.channelIndex === idx ? focus.focusedProgramId : null}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
    zIndex: 10,
  },
  backButton: { marginRight: 15 },
  title: {
    flex: 1,
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { marginRight: 20 },
  gridContainer: { flex: 1 },
  gridContents: { flex: 1 },
  rowWrapper: {
    width: '100%',
  },
  selectedRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.4)', marginTop: 15, fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#09090b',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    marginLeft: 15,
  },
});
