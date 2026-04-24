import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Switch,
  Alert
} from 'react-native';
import api from '../services/api';
import { Megaphone, ExternalLink, Zap, MousePointer2, Trash2 } from 'lucide-react-native';

export default function AdsScreen() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await api.get('/ads');
      setAds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const toggleAd = async (id: string, current: boolean) => {
    try {
      await api.patch(`/ads/${id}`, { isActive: !current });
      setAds(prev => prev.map(a => a.id === id ? { ...a, isActive: !current } : a));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier le statut.');
    }
  };

  if (loading) return (
    <View style={styles.loader}>
        <ActivityIndicator color="#6366F1" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion <Text style={styles.accent}>Ads</Text></Text>
        <TouchableOpacity style={styles.addButton}>
            {(Zap as any)({ size: 14, color: "#FFF" })}
        </TouchableOpacity>
      </View>

      <FlatList 
        data={ads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.adCard}>
                <View style={styles.adInfo}>
                    <View style={[styles.platformBadge, { backgroundColor: item.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(75, 85, 99, 0.1)' }]}>
                        <Text style={[styles.platformText, { color: item.isActive ? '#10B981' : '#4B5563' }]}>
                            {item.platform}
                        </Text>
                    </View>
                    <Text style={styles.adTitle}>{item.title || "Ads AI Generated"}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            {(Zap as any)({ size: 10, color: "#4B5563" })}
                            <Text style={styles.statText}>Weight: {item.weight}</Text>
                        </View>
                        <View style={styles.stat}>
                            {(MousePointer2 as any)({ size: 10, color: "#6366F1" })}
                            <Text style={[styles.statText, { color: '#6366F1' }]}>{item.ctr}% CTR</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.controls}>
                    <Switch 
                        value={item.isActive} 
                        onValueChange={() => toggleAd(item.id, item.isActive)}
                        trackColor={{ false: '#1F2937', true: 'rgba(99, 102, 241, 0.2)' }}
                        thumbColor={item.isActive ? '#6366F1' : '#4B5563'}
                    />
                    <TouchableOpacity style={styles.deleteBtn}>
                        {(Trash2 as any)({ size: 16, color: "#EF4444" })}
                    </TouchableOpacity>
                </View>
            </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    padding: 24,
  },
  loader: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  accent: {
    color: '#6366F1',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  adCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  adInfo: {
    flex: 1,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  platformText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  adTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
  },
  controls: {
    alignItems: 'center',
    gap: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#1F2937',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
  }
});
