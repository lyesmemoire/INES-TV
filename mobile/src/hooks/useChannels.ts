import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../services/supabase';
import { fetchLiveChannels } from '../services/channelApi';
import { Channel, NetworkType, NetworkQuality } from '../types';

interface UseChannelsResult {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  networkType: NetworkType;
  networkQuality: NetworkQuality;
  refresh: () => void;
}

export function useChannels(): UseChannelsResult {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkType, setNetworkType] = useState<NetworkType>('WIFI');
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('EXCELLENT');

  // Monitor network
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setNetworkType('OFFLINE');
        setNetworkQuality('POOR');
        return;
      }
      setNetworkType(state.type === 'cellular' ? 'CELLULAR' : 'WIFI');
      const downlink = (state as any).details?.linkSpeed;
      if (downlink !== undefined) {
        setNetworkQuality(downlink < 5 ? 'POOR' : downlink < 20 ? 'MODERATE' : 'EXCELLENT');
      }
    });
    return unsubscribe;
  }, []);

  const loadChannels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Try to fetch from Supabase directly
      const { data, error: sbError } = await supabase
        .from('Channel')
        .select('*')
        .eq('isActive', true);

      if (sbError) throw sbError;
      
      if (data && data.length > 0) {
        setChannels(data as Channel[]);
      } else {
        // Fallback to API
        const apiData = await fetchLiveChannels();
        setChannels(apiData);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection error';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();

    // 2. Set up Real-time subscription
    const channelSub = supabase
      .channel('public:Channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Channel' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setChannels(prev => prev.map(ch => ch.id === payload.new.id ? { ...ch, ...payload.new } : ch));
        } else if (payload.eventType === 'INSERT') {
          setChannels(prev => {
            if (prev.find(c => c.id === payload.new.id)) return prev;
            return [...prev, payload.new as Channel]
          });
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => prev.filter(ch => ch.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { channelSub.unsubscribe(); };
  }, [loadChannels]);

  return { channels, isLoading, error, networkType, networkQuality, refresh: loadChannels };
}
