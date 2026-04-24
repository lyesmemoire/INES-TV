import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useUserStore } from '../../store/useUserStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useAuth } from '../../../context/AuthContext';

/**
 * 🛰️ CHANNEL ITEM (Premium UI)
 */
export default function ChannelItem({ channel, index }: { channel: any, index: number }) {
  const { setChannelIndex, currentIndex } = usePlayerStore();
  const { favorites, toggleFavorite } = useUserStore();
  const { activeProfile } = useProfileStore();
  const { user } = useAuth();
  
  const isActive = currentIndex === index;
  const isFavorite = favorites.includes(channel.name);

  const handleFavorite = (e: any) => {
    e.stopPropagation();
    if (user && activeProfile) {
      toggleFavorite(user.id, activeProfile.id, channel.name);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setChannelIndex(index)}
      style={[styles.container, isActive && styles.activeContainer]}
    >
      <View style={styles.content}>
        {channel.logo ? (
          <Image source={{ uri: channel.logo }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
             <Text style={styles.placeholderChar}>{channel.name[0]}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.name, isActive && styles.activeText]}>{channel.name}</Text>
          <Text style={styles.group}>{channel.group || 'Général'}</Text>
        </View>

        {/* ⭐ FAVORITE TOGGLE */}
        <TouchableOpacity onPress={handleFavorite} style={styles.favoriteBtn}>
          <Star 
            size={20} 
            color={isFavorite ? '#10B981' : 'rgba(255,255,255,0.2)'} 
            fill={isFavorite ? '#10B981' : 'transparent'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1f1f23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderChar: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '700',
  },
  activeText: {
    color: 'white',
  },
  group: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  favoriteBtn: {
    padding: 8,
    marginRight: -4,
  },
});
