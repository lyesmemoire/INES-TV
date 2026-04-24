import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useChannels } from '../../src/hooks/useChannels';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites, isAuthenticated } = useAuth();
  const { channels } = useChannels();
  const router = useRouter();

  const favoriteChannels = channels.filter(c => favorites.includes(c.id));

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Connectez-vous</Text>
        <Text style={styles.subtitle}>Pour voir vos favoris, identifiez-vous dans l'onglet Profil.</Text>
      </View>
    );
  }

  if (favoriteChannels.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.title}>Aucun favori</Text>
        <Text style={styles.subtitle}>Ajoutez des chaînes à vos favoris pour les retrouver ici.</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.header}>Mes Favoris</Text>
      <FlatList
        data={favoriteChannels}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push(`/player/${item.id}`)}
            style={styles.card}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category.toUpperCase()}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center', padding: 40 },
  listContainer: { flex: 1, backgroundColor: '#09090b', paddingTop: 60 },
  header: { color: 'white', fontSize: 28, fontWeight: '900', paddingHorizontal: 20, marginBottom: 10 },
  emoji: { fontSize: 50, marginBottom: 10 },
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  subtitle: { color: '#A1A1AA', marginTop: 10, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  
  card: { flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  thumb: { width: 120, height: 70 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { color: 'white', fontSize: 16, fontWeight: '700' },
  category: { color: '#10B981', fontSize: 10, fontWeight: '900', marginTop: 4 }
});
