import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Play, Star, Calendar, User, Clock, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

/**
 * 🎬 MEDIA DETAILS SCREEN (Netflix Style)
 * Premium UI for Movies and Series details.
 */
export default function MediaDetailsScreen({ media, type }: { media: any, type: 'movie' | 'series' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSeason, setSelectedSeason] = useState(1);

  const episodes = type === 'series' 
    ? media.episodes.filter((e: any) => e.season === selectedSeason)
    : [];

  const seasons = type === 'series'
    ? Array.from(new Set(media.episodes.map((e: any) => e.season))).sort((a: any, b: any) => a - b)
    : [];

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* 🖼️ HERO BACKDROP */}
      <View style={styles.heroWrapper}>
        <Image source={{ uri: media.backdrop || media.poster }} style={styles.backdrop} />
        <View style={styles.overlay} />
        
        <TouchableOpacity 
          style={[styles.backButton, { top: insets.top + 10 }]} 
          onPress={() => router.back()}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Text style={styles.title}>{media.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingInfo}>
              <Star size={14} color="#10B981" fill="#10B981" />
              <Text style={styles.ratingText}>{media.rating || 'N/A'}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{media.year || '2024'}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.genreBadge}>{media.genre || 'Action'}</Text>
          </View>
        </View>
      </View>

      {/* 📖 PLOT & INFO */}
      <View style={styles.detailsContent}>
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.plotText}>
          {media.plot || "Aucune description disponible pour ce contenu pour le moment."}
        </Text>

        {type === 'movie' && (
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => router.push(`/player/movie-${media.id}`)}
          >
            <Play size={20} color="black" fill="black" />
            <Text style={styles.playButtonText}>LIRE LE FILM</Text>
          </TouchableOpacity>
        )}

        {/* 📺 EPISODES (For Series) */}
        {type === 'series' && (
          <View style={styles.episodesSection}>
            <View style={styles.seasonHeader}>
              <Text style={styles.sectionTitle}>Épisodes</Text>
              <View style={styles.seasonSelector}>
                {seasons.map((s: any) => (
                  <TouchableOpacity 
                    key={String(s)} 
                    onPress={() => setSelectedSeason(s as number)}
                    style={[styles.seasonTab, selectedSeason === s && styles.activeSeasonTab]}
                  >
                    <Text style={[styles.seasonTabText, selectedSeason === s && styles.activeSeasonTabText]}>
                      S{s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.episodeList}>
              {episodes.map((ep: any) => (
                <TouchableOpacity 
                  key={ep.id} 
                  style={styles.episodeContainer}
                  onPress={() => router.push(`/player/ep-${ep.id}`)}
                >
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeNum}>{ep.episode}.</Text>
                    <Text style={styles.episodeTitle}>{ep.title || `Épisode ${ep.episode}`}</Text>
                  </View>
                  <Play size={16} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  heroWrapper: { height: height * 0.6, width: '100%', position: 'relative' },
  backdrop: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
    // Add real gradient in prod using expo-linear-gradient
  },
  backButton: { 
    position: 'absolute', 
    left: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  heroContent: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  title: { color: 'white', fontSize: 32, fontWeight: '900', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#10B981', fontWeight: '900', fontSize: 14 },
  dot: { color: 'rgba(255,255,255,0.3)' },
  metaText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 'bold' },
  genreBadge: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '900', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  detailsContent: { padding: 24 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  plotText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 22, marginBottom: 30 },
  playButton: { 
    backgroundColor: '#10B981', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: 12, 
    gap: 12 
  },
  playButtonText: { color: 'black', fontWeight: '900', fontSize: 16 },
  
  episodesSection: { marginTop: 10 },
  seasonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  seasonSelector: { flexDirection: 'row', gap: 8 },
  seasonTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1f1f23' },
  activeSeasonTab: { backgroundColor: '#10B981' },
  seasonTabText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '900' },
  activeSeasonTabText: { color: 'black' },
  
  episodeList: { gap: 1 },
  episodeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  episodeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  episodeNum: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 'bold' },
  episodeTitle: { color: 'white', fontSize: 15, fontWeight: 'bold' },
});
