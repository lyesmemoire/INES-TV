import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import { MotiView } from 'moti';
import { Play, Activity, Calendar } from 'lucide-react-native';
import { Channel } from '../types';

interface SportsDashboardProps {
  channels: Channel[];
  onSelect: (channel: Channel) => void;
}

export default function SportsDashboard({ channels, onSelect }: SportsDashboardProps) {
  const sportsChannels = useMemo(() => {
    return channels.filter(c => c.category === 'Football' || c.category === 'Basketball' || c.homeName);
  }, [channels]);

  const liveMatches = sportsChannels.filter(c => c.status === 'LIVE' || (!c.status && c.score));
  const upcomingMatches = sportsChannels.filter(c => c.status === 'UPCOMING');
  
  const featuredMatch = liveMatches.length > 0 ? liveMatches[0] : upcomingMatches[0] || sportsChannels[0];

  if (!featuredMatch) return null;

  const renderMatchCard = ({ item, index }: { item: Channel, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 100 }}
    >
      <Pressable 
        style={styles.cardContainer}
        onPress={() => onSelect(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLeague}>{item.league || 'Event'}</Text>
          {item.status === 'LIVE' ? (
            <View style={styles.cardLiveBox}>
              <View style={[styles.liveDot, { width: 4, height: 4 }]} />
              <Text style={styles.cardTimeLive}>{item.matchTime}</Text>
            </View>
          ) : (
            <Text style={styles.cardTime}>{item.matchTime}</Text>
          )}
        </View>

        <View style={styles.cardTeams}>
          <View style={styles.cardTeamRow}>
            <Image source={{ uri: item.homeLogo || item.thumbnail }} style={styles.cardLogo} />
            <Text style={styles.cardTeamName}>{item.homeName || 'Home'}</Text>
          </View>
          <View style={styles.cardTeamRow}>
            <Image source={{ uri: item.awayLogo || item.thumbnail }} style={styles.cardLogo} />
            <Text style={styles.cardTeamName}>{item.awayName || 'Away'}</Text>
          </View>
        </View>

        <View style={styles.cardScoreBox}>
          <Text style={styles.cardScore}>{item.score || '-'}</Text>
        </View>
      </Pressable>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* Featured Match Hero */}
      <MotiView 
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.heroContainer}
      >
        <Image source={{ uri: featuredMatch.thumbnail }} style={styles.heroBg} blurRadius={20} />
        <View style={styles.heroOverlay} />

        <View style={styles.heroTop}>
          <View style={styles.leagueBadge}>
            <Text style={styles.leagueText}>{featuredMatch.league || 'Featured'}</Text>
          </View>
          {featuredMatch.status === 'LIVE' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.heroMatch}>
          <View style={styles.heroTeam}>
            <Image source={{ uri: featuredMatch.homeLogo || featuredMatch.thumbnail }} style={styles.heroLogo} />
            <Text style={styles.heroTeamName}>{featuredMatch.homeName}</Text>
          </View>

          <View style={styles.heroCenter}>
            <Text style={styles.heroScore}>{featuredMatch.score || 'VS'}</Text>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{featuredMatch.matchTime || 'Upcoming'}</Text>
            </View>
          </View>

          <View style={styles.heroTeam}>
            <Image source={{ uri: featuredMatch.awayLogo || featuredMatch.thumbnail }} style={styles.heroLogo} />
            <Text style={styles.heroTeamName}>{featuredMatch.awayName}</Text>
          </View>
        </View>

        <Pressable 
          style={styles.heroPlayBtn}
          onPress={() => onSelect(featuredMatch)}
        >
          <Play size={16} color="black" fill="black" />
          <Text style={styles.heroPlayText}>Watch Match</Text>
        </Pressable>
      </MotiView>

      {/* Live Matches List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={18} color="#EF4444" />
          <Text style={styles.sectionTitle}>Live Matches</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={liveMatches.filter(m => m.id !== featuredMatch.id)}
          keyExtractor={item => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No other live matches right now.</Text>}
        />
      </View>

      {/* Upcoming Matches List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={18} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcomingMatches.filter(m => m.id !== featuredMatch.id)}
          keyExtractor={item => item.id}
          renderItem={renderMatchCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No upcoming matches scheduled.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  
  heroContainer: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', backgroundColor: '#064E3B', padding: 20, elevation: 10, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 20 },
  heroBg: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroTop: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  leagueBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  leagueText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { color: '#F87171', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  heroMatch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  heroTeam: { flex: 1, alignItems: 'center', gap: 8 },
  heroLogo: { width: 50, height: 50, resizeMode: 'contain' },
  heroTeamName: { color: 'white', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  heroCenter: { flex: 1, alignItems: 'center', gap: 6 },
  heroScore: { color: 'white', fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timeBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  timeText: { color: '#34D399', fontSize: 10, fontWeight: '800' },
  
  heroPlayBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 10 },
  heroPlayText: { color: 'black', fontSize: 14, fontWeight: '900' },

  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  listContent: { paddingHorizontal: 16, gap: 12 },
  
  cardContainer: { width: 200, backgroundColor: '#18181B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLeague: { color: '#A1A1AA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cardTime: { color: '#71717A', fontSize: 10, fontWeight: '800' },
  cardLiveBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardTimeLive: { color: '#EF4444', fontSize: 10, fontWeight: '900' },
  cardTeams: { gap: 8 },
  cardTeamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLogo: { width: 24, height: 24, resizeMode: 'contain' },
  cardTeamName: { color: 'white', fontSize: 13, fontWeight: '800' },
  cardScoreBox: { position: 'absolute', right: 16, top: 40, bottom: 0, justifyContent: 'center' },
  cardScore: { color: 'white', fontSize: 24, fontWeight: '900', opacity: 0.8 }  
});
