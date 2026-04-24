import { create } from 'zustand';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  is_kids: boolean;
}

interface ProfileState {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  isLoading: boolean;

  fetchProfiles: (userId: string) => Promise<void>;
  selectProfile: (profile: UserProfile) => Promise<void>;
  createProfile: (userId: string, name: string, avatar: string, isKids: boolean) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
}

/**
 * 👤 GLOBAL PROFILE STORE (Netflix Core)
 * Manages family sub-profiles and data isolation.
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,
  isLoading: false,

  fetchProfiles: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ profiles: data || [] });

      // Auto-select last profile if available
      const savedProfileId = await AsyncStorage.getItem('activeProfileId');
      if (savedProfileId) {
        const profile = data?.find(p => p.id === savedProfileId);
        if (profile) set({ activeProfile: profile });
      }
    } catch (err) {
      console.error('[ProfileStore] Fetch failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectProfile: async (profile: UserProfile) => {
    set({ activeProfile: profile });
    await AsyncStorage.setItem('activeProfileId', profile.id);
  },

  createProfile: async (userId: string, name: string, avatar: string, isKids: boolean) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ user_id: userId, name, avatar_url: avatar, is_kids: isKids }])
        .select()
        .single();

      if (error) throw error;
      const currentProfiles = get().profiles;
      set({ profiles: [...currentProfiles, data] });
    } catch (err) {
      console.error('[ProfileStore] Create failed:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProfile: async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      const newProfiles = get().profiles.filter(p => p.id !== profileId);
      set({ profiles: newProfiles });
      if (get().activeProfile?.id === profileId) set({ activeProfile: null });
    } catch (err) {
      console.error('[ProfileStore] Delete failed:', err);
    }
  },
}));
