import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import MediaDetailsScreen from '../../src/components/Media/MediaDetailsScreen';
import { useMedia } from '../../src/hooks/useMedia';
import { View, ActivityIndicator } from 'react-native';

export default function MediaDetailsRoute() {
  const { id, type } = useLocalSearchParams();
  const { movies, series, isLoading } = useMedia();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  const media = type === 'movie' 
    ? movies.find(m => m.id === id)
    : series.find(s => s.id === id);

  if (!media) return null;

  return <MediaDetailsScreen media={media} type={type as 'movie' | 'series'} />;
}
