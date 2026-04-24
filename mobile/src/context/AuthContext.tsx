import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';

interface AuthContextType {
  token: string | null;
  user: any | null;
  favorites: string[];
  lastAdAt: Date | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (channelId: string, channelData?: any) => Promise<void>;
  markAdShown: () => void;
  shouldShowAd: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [lastAdAt, setLastAdAt] = useState<Date | null>(null);

  // Base URL for API (sync with channelApi.ts)
  const BASE_URL = 'http://10.0.2.2:3000'; // Adjustment for Android emulator

  // Load token on mount
  useEffect(() => {
    async function load() {
      // In a real app, use SecureStore.getItemAsync('user_token')
      // setToken(savedToken);
    }
    load();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setFavorites(data.user.favorites?.map((f: any) => f.channelId) || []);
      }
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  // Real-time listener for FavoriteChannel based on User ID
  useEffect(() => {
    if (!user?.id) return;

    const favSub = supabase
      .channel('public:FavoriteChannel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'FavoriteChannel', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFavorites(prev => {
              if (prev.includes(payload.new.channel_id)) return prev;
              return [...prev, payload.new.channel_id];
            });
          } else if (payload.eventType === 'DELETE') {
            setFavorites(prev => prev.filter(id => id !== payload.old.channel_id));
          }
        }
      )
      .subscribe();

    return () => {
      favSub.unsubscribe();
    };
  }, [user?.id]);

  const logout = () => {
    setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (channelId: string, channelData?: any) => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channelId, channelData })
      });
      if (res.ok) {
        setFavorites(prev => 
          prev.includes(channelId) 
            ? prev.filter(id => id !== channelId) 
            : [...prev, channelId]
        );
      }
    } catch (e) {
      console.error('Toggle favorite failed', e);
    }
  };

  const markAdShown = () => {
    setLastAdAt(new Date());
  };

  const shouldShowAd = () => {
    if (user?.role === 'PREMIUM' || user?.role === 'ADMIN') return false;
    if (!lastAdAt) return true;
    const fifteenMinutes = 15 * 60 * 1000;
    return (new Date().getTime() - lastAdAt.getTime()) >= fifteenMinutes;
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user,
      favorites, 
      lastAdAt,
      isAuthenticated: !!token, 
      login, 
      logout,
      toggleFavorite,
      markAdShown,
      shouldShowAd
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
