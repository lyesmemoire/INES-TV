'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  favorites: string[]; // List of favorited channel IDs
  lastAdAt: Date | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (channelId: string, channelData: any) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  markAdShown: () => void;
  shouldShowAd: () => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  refreshSession: () => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lastAdAt, setLastAdAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  // 1. Initialiser le Fingerprint
  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setVisitorId(result.visitorId);
    };
    setFp();
  }, []);

  // 2. Synchronisation Fingerprint (Désactivée - Gérée nativement par le middleware Supabase sur le Backend)
  useEffect(() => {
    if (token && visitorId) {
       // On ne fait plus de fetch /api/auth/me ici car le backend vérifie
       // directement le token Supabase via le middleware requireAuth
    }
  }, [token, visitorId]);


  useEffect(() => {
    // 3. Check for current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'USER',
          name: session.user.user_metadata?.name
        });
      }
      setIsLoading(false);
    });

    // 4. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'USER',
          name: session.user.user_metadata?.name
        });
      } else {
        setToken(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 4b. Background session keep-alive (Anti-Timeout)
  useEffect(() => {
    if (!token) return;

    // Refresh every 45 minutes to keep JWT alive before expiry
    const REFRESH_INTERVAL = 45 * 60 * 1000;
    const intervalId = setInterval(async () => {
      console.log('[Auth] 🔄 Auto-refreshing session...');
      await refreshSession();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token]);


  const fetchFavorites = async () => {
    if (!token || !user) return;
    try {
      // In a real app, this would be a Supabase query or an API call
      // Since we just migrated the DB, we'll try to use Supabase Client for this
      const { data, error } = await supabase
        .from('FavoriteChannel')
        .select('channelId')
        .eq('userId', user.id);
      
      if (!error && data) {
        setFavorites(data.map(f => f.channelId));
      }
    } catch (e) {
      console.error('Failed to fetch favorites', e);
    }
  };

  useEffect(() => {
    if (!token || !user?.id) {
      setFavorites([]);
      return;
    }
    
    fetchFavorites();

    const favSub = supabase
      .channel('public:FavoriteChannel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'FavoriteChannel', filter: `userId=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFavorites(prev => {
              if (prev.includes(payload.new.channelId)) return prev;
              return [...prev, payload.new.channelId];
            });
          } else if (payload.eventType === 'DELETE') {
            setFavorites(prev => prev.filter(id => id !== payload.old.channelId));
          }
        }
      )
      .subscribe();

    return () => {
      favSub.unsubscribe();
    };
  }, [token, user?.id]);

  const toggleFavorite = async (channelId: string, _channelData: any) => {
    if (!token || !user) return setAuthModalOpen(true);
    
    const isFav = favorites.includes(channelId);
    setFavorites(prev => isFav ? prev.filter(id => id !== channelId) : [...prev, channelId]);

    try {
      if (isFav) {
        await supabase
          .from('FavoriteChannel')
          .delete()
          .match({ userId: user.id, channelId });
      } else {
        await supabase
          .from('FavoriteChannel')
          .insert({ userId: user.id, channelId });
      }
    } catch (e) {
      fetchFavorites();
    }
  };

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      // If refresh fails, try getting current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          role: currentSession.user.user_metadata?.role || 'USER',
          name: currentSession.user.user_metadata?.name
        });
      }
      return;
    }
    if (session) {
      setToken(session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'USER',
        name: session.user.user_metadata?.name
      });
    }
  };

  const markAdShown = () => {
    const now = new Date();
    setLastAdAt(now);
  };

  const shouldShowAd = () => {
    // 1. Premium users never see ads
    if (user?.role === 'PREMIUM') return false;

    // 2. First ad: If no ad shown yet in this session, show it
    if (!lastAdAt) return true;

    // 3. Every 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    const diff = new Date().getTime() - lastAdAt.getTime();
    return diff >= fifteenMinutes;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      favorites,
      lastAdAt,
      fetchFavorites,
      toggleFavorite,
      login,
      logout,
      markAdShown,
      shouldShowAd,
      isAuthenticated: !!token,
      isLoading,
      isAuthModalOpen,
      setAuthModalOpen,
      refreshSession,
      isPremium: user?.role === 'PREMIUM' || user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
