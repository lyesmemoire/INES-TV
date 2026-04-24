import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import api from '../services/api';
import { Users, CreditCard, Clock, ChevronRight, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ResellersScreen() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResellers = async () => {
    try {
      const res = await api.get('/resellers');
      setResellers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  if (loading) return (
    <View style={styles.loader}>
        <ActivityIndicator color="#6366F1" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réseau <Text style={styles.accent}>B2B</Text></Text>
        <TouchableOpacity style={styles.addButton}>
            <PlusIcon color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={resellers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <View style={styles.creditsBadge}>
                        <Text style={styles.creditsText}>{item.credits} CR</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Utilisateurs</Text>
                        <Text style={styles.statValue}>{item.userCount}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>Watch Time</Text>
                        <Text style={styles.statValue}>{Math.round(item.totalWatchTime / 60)}m</Text>
                    </View>
                    <View style={styles.stat}>
                        {(Activity as any)({ size: 14, color: "#10B981" })}
                        <Text style={styles.statLabel}>Statut OK</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function PlusIcon({ color }: any) {
    return <View style={{ width: 14, height: 2, backgroundColor: color, borderRadius: 1 }} />;
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
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  avatarText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
  creditsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  creditsText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  stat: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statLabel: {
    color: '#4B5563',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
