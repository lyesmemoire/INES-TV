import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useProfileStore } from '../src/store/useProfileStore';
import { Plus, Settings } from 'lucide-react-native';

/**
 * 👤 PROFILE PICKER SCREEN (Netflix Style)
 * Forced entry point for multi-user accounts.
 */
export default function ProfilePickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles, isLoading, fetchProfiles, selectProfile } = useProfileStore();

  useEffect(() => {
    if (user) fetchProfiles(user.id);
  }, [user]);

  const handleSelect = async (profile: any) => {
    await selectProfile(profile);
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Qui regarde ?</Text>
      </View>

      <FlatList
        data={profiles}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.profileItem} onPress={() => handleSelect(item)}>
            <View style={[styles.avatarWrapper, item.is_kids && styles.kidsWrapper]}>
              <Image 
                source={{ uri: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.name }} 
                style={styles.avatar} 
              />
              {item.is_kids && (
                <View style={styles.kidsBadge}>
                  <Text style={styles.kidsText}>KIDS</Text>
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          profiles.length < 5 ? (
            <TouchableOpacity style={styles.addProfileItem} onPress={() => router.push('/profile-create')}>
              <View style={styles.addWrapper}>
                <Plus color="rgba(255,255,255,0.4)" size={40} />
              </View>
              <Text style={styles.addText}>Ajouter un profil</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <TouchableOpacity style={styles.manageButton}>
        <Settings color="white" size={18} />
        <Text style={styles.manageText}>GÉRER LES PROFILS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', paddingTop: 80 },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  listContainer: { alignItems: 'center', paddingBottom: 100 },
  profileItem: { alignItems: 'center', margin: 20 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  kidsWrapper: { borderWidth: 3, borderColor: '#10B981' },
  avatar: { width: '100%', height: '100%' },
  profileName: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' },
  
  kidsBadge: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#10B981', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 2
  },
  kidsText: { color: 'black', fontWeight: 'bold', fontSize: 10 },
  
  addProfileItem: { alignItems: 'center', margin: 20 },
  addWrapper: { 
    width: 120, 
    height: 120, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderStyle: 'dashed',
    marginBottom: 12
  },
  addText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  
  manageButton: { 
    position: 'absolute', 
    bottom: 50, 
    alignSelf: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4
  },
  manageText: { color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }
});
