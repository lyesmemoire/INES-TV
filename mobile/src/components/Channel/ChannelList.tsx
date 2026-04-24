import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ChannelItem from './ChannelItem';
import { usePlayerStore } from '../../store/usePlayerStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useAuth } from '../../../context/AuthContext';

/**
 * 🛰️ CHANNEL LIST (Staff Pro Edition)
 * Features Source-Aware filtering and premium source tabs.
 */
export default function ChannelList() {
  const { channels } = usePlayerStore();
  const { playlists, selectedPlaylistId, setSelectedPlaylist, fetchPlaylists } = usePlaylistStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchPlaylists(user.id);
  }, [user]);

  // 🔥 FILTER CHANNELS BY SOURCE
  const filteredChannels = selectedPlaylistId 
    ? channels.filter((c: any) => c.playlistId === selectedPlaylistId)
    : channels;

  return (
    <View style={styles.container}>
      {/* 🚀 SOURCE SELECTOR TABS */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          <TouchableOpacity 
            onPress={() => setSelectedPlaylist(null)}
            style={[styles.tab, !selectedPlaylistId && styles.activeTab]}
          >
            <Text style={[styles.tabText, !selectedPlaylistId && styles.activeTabText]}>TOUT</Text>
          </TouchableOpacity>

          {playlists.map((pl) => (
            <TouchableOpacity 
              key={pl.id}
              onPress={() => setSelectedPlaylist(pl.id)}
              style={[styles.tab, selectedPlaylistId === pl.id && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedPlaylistId === pl.id && styles.activeTabText]}>
                {pl.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredChannels}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <ChannelItem channel={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  tabsWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1f1f23',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#10B981',
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
});
