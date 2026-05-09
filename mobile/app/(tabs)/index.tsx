import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, TrendingUp, Star, Tv } from 'lucide-react-native';

import { useChannels } from '../../src/hooks/useChannels';
import { useMedia } from '../../src/hooks/useMedia';
import { useUserStore } from '../../src/store/useUserStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useAuth } from '../../src/context/AuthContext';
import Carousel from '../../src/components/UI/Carousel';
import SportsDashboard from '../../src/components/SportsDashboard';

/**
 * 🏠 NETFLIX-STYLE DASHBOARD (Phase 60 - Profiles Edition)
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { channels, isLoading: channelsLoading, refresh: refreshChannels } = useChannels();
  const { movies, series, isLoading: mediaLoading } = useMedia();
  const { activeProfile } = useProfileStore();
  const { recentChannels, fetchUserData } = useUserStore();
  const { user } = useAuth();
  
  // 🔥 REDIRECT TO PROFILE PICKER IF NONE ACTIVE
  useEffect(() => {
    if (!activeProfile) {
      router.replace('/profiles' as any);
    } else if (user) {
      fetchUserData(user.id);
    }
  }, [activeProfile, user]);

  const isLoading = channelsLoading || mediaLoading;

  // 🛡️ KIDS MODE FILTERING LOGIC
  const filterRestricted = (list: any[]) => {
    if (!activeProfile?.is_kids) return list;
    const restrictedCategories = ['adult', 'horror', 'action', 'thriller', 'crime'];
    return list.filter(item => 
      !restrictedCategories.includes((item.category || '').toLowerCase()) &&
      !restrictedCategories.includes((item.genre || '').toLowerCase())
    );
  };
  
  // 🍿 Content Segmentation (Filtered)
  const safeChannels = filterRestricted(channels);
  const safeMovies = filterRestricted(movies);
  const safeSeries = filterRestricted(series);

  const heroChannel = safeChannels.length > 0 ? safeChannels[0] : null;
  const trending = safeChannels.filter(c => c.viewers && parseInt(c.viewers) > 1000);
  const liveSport = safeChannels.filter(c => c.category?.toLowerCase() === 'sports' || c.category?.toLowerCase() === 'football');
  const otherChannels = safeChannels.filter(c => !trending.includes(c));

  // Map recent IDs to channel objects
  const recentData = recentChannels
    .map(id => safeChannels.find(c => c.name === id))
    .filter(Boolean);
  
  const handleChannelPress = (item: any) => {
    router.push(`/player/${item.id}` as any);
  };

  const handleMediaPress = (item: any, type: string) => {
    router.push({
      pathname: `/media/${item.id}` as any,
      params: { type }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 🏙️ PREMIUM HEADER */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>SP</Text>
        </View>
        <Text style={styles.headerTitle}>INES TV</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshChannels} tintColor="#10B981" />}
      >
        {/* 🕒 RECENTLY WATCHED */}
        {recentData.length > 0 && (
          <Carousel 
            title="Reprise de lecture" 
            data={recentData} 
            onItemPress={handleChannelPress} 
          />
        )}

        {/* 🎬 HERO SECTION */}
        {/* ... (existing hero logic) */}

        {/* 🎞️ MOVIES CAROUSEL */}
        {movies.length > 0 && (
          <Carousel 
            title="Films à l'affiche" 
            data={movies} 
            onItemPress={(item) => handleMediaPress(item, 'movie')} 
          />
        )}

        {/* 📺 SERIES CAROUSEL */}
        {series.length > 0 && (
          <Carousel 
            title="Séries Populaires" 
            data={series} 
            onItemPress={(item) => handleMediaPress(item, 'series')} 
          />
        )}

        {/* 📈 TRENDING CAROUSEL */}
        <Carousel 
          title="Tendance Direct TV" 
          data={trending.map(c => ({ ...c, status: "LIVE" }))} 
          onItemPress={handleChannelPress} 
        />
        {/* 🎬 HERO SECTION (Featured Content) */}
        {heroChannel && (
          <View style={styles.heroWrapper}>
            <Image source={{ uri: heroChannel.thumbnail }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroBadge}>CHAMPIONS LEAGUE</Text>
              <Text style={styles.heroTitle}>{heroChannel.name}</Text>
              <Pressable 
                style={styles.heroButton}
                onPress={() => handleChannelPress(heroChannel)}
              >
                <Play size={18} color="black" fill="black" />
                <Text style={styles.heroButtonText}>REGARDER MAINTENANT</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ⚽ LIVE SPORTS (Section Dashboard) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tv size={18} color="#10B981" />
            <Text style={styles.sectionLabel}>MATCHS EN DIRECT</Text>
          </View>
          <SportsDashboard channels={liveSport} onSelect={handleChannelPress} />
        </View>

        {/* 📈 TRENDING CAROUSEL */}
        <Carousel 
          title="Tendance Actuelle" 
          data={trending.map(c => ({ ...c, status: "LIVE" }))} 
          onItemPress={handleChannelPress} 
        />

        {/* ⭐ RECOMMENDED CAROUSEL */}
        <Carousel 
          title="Pour Vous" 
          data={otherChannels.slice(0, 8)} 
          onItemPress={handleChannelPress} 
        />

        {/* 🙏 CATEGORIES FOOTER (Visual Placeholder) */}
        <View style={styles.footerInfo}>
          <Star size={16} color="gold" />
          <Text style={styles.footerText}>MEMBRE PREMIUM ACTIF</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingBottom: 16,
    zIndex: 10
  },
  logoBox: { 
    width: 32, 
    height: 32, 
    backgroundColor: '#10B981', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 10 
  },
  logoText: { color: 'black', fontSize: 14, fontWeight: '900' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  
  scrollView: { flex: 1 },
  
  heroWrapper: { 
    marginHorizontal: 16, 
    height: 380, 
    borderRadius: 24, 
    overflow: 'hidden', 
    position: 'relative',
    marginBottom: 24
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)',
    // Gradient simulated with overlay
  },
  heroContent: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20,
    alignItems: 'flex-start'
  },
  heroBadge: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8
  },
  heroTitle: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '900', 
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  heroButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 14, 
    gap: 10 
  },
  heroButtonText: { color: 'black', fontWeight: '900', fontSize: 14 },

  section: { marginBottom: 12 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    gap: 8,
    marginBottom: 12 
  },
  sectionLabel: { color: 'white', fontSize: 14, fontWeight: '900' },

  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingBottom: 60,
    opacity: 0.3
  },
  footerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  }
});
