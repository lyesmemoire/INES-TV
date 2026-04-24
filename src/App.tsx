'use client';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DeviceTier, NetworkQuality, NetworkType, Channel } from './types';
import { MOCK_CHANNELS, injectMockData } from './utils/mock';

// ── Layouts ──────────────────────────────────────────────────────────────────
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Mobile/BottomNav';
import Hero from './components/Home/Hero';
import CategoryFilter from './components/Home/CategoryFilter';
import ChannelGrid from './components/Home/ChannelGrid';
import MobilePlayerCard from './components/Mobile/MobilePlayerCard';
import MobileChannelList from './components/Mobile/MobileChannelList';
import TvLayout from './components/TV/TvLayout';
import AndroidCodeViewer from './components/AndroidCodeViewer';
import RecommendationRow from './components/Home/RecommendationRow';
import SportsDashboard from './components/Dashboard/SportsDashboard';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

import { supabase } from '@/lib/supabase';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import AuthModal from './components/Auth/AuthModal';
import PlayerModal from './components/Player/PlayerModal';
import PremiumLoginModal from './components/PremiumLoginModal';
import AdsBanner from './components/AdsBanner';

// ── Platform detection ───────────────────────────────────────────────────────
type Platform = 'web' | 'mobile' | 'tv';

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  const isTV = /android tv|googletv|chromecast|smarttv|hbbtv|netcast|opera tv|philips|samsung|webos|tizen/i.test(ua);
  if (isTV) return 'tv';
  const isMobile = window.innerWidth < 768 || /android|iphone|ipad|ipod/i.test(ua);
  if (isMobile) return 'mobile';
  return 'web';
}

declare global {
  interface Navigator {
    connection?: {
      downlink: number; effectiveType: string; type?: string;
      addEventListener(type: string, listener: () => void): void;
      removeEventListener(type: string, listener: () => void): void;
    };
  }
}

import { syncChannels } from './services/channelService';

// ── DevTools Platform Switcher (dev only) ─────────────────────────────────────
function DevSwitcher({ platform, onChange, view, onChangeView }: { 
    platform: Platform; 
    onChange: (p: Platform) => void;
    view: 'home' | 'analytics';
    onChangeView: (v: 'home' | 'analytics') => void;
}) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2">
      <div className="flex items-center gap-1 bg-black/90 border border-white/10 rounded-xl p-1 backdrop-blur-xl shadow-2xl">
        {(['web', 'mobile', 'tv'] as Platform[]).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              platform === p ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {p === 'web' ? '🖥' : p === 'mobile' ? '📱' : '📺'} {p.toUpperCase()}
          </button>
        ))}
      </div>
      <button 
        onClick={() => syncChannels()}
        className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-xl p-2 text-[10px] font-black text-emerald-400 backdrop-blur-xl transition-all uppercase tracking-widest mb-1"
      >
        Sync to Supabase ☁️
      </button>
      <button 
        onClick={() => onChangeView(view === 'home' ? 'analytics' : 'home')}
        className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl p-2 text-[10px] font-black text-blue-400 backdrop-blur-xl transition-all uppercase tracking-widest"
      >
        {view === 'home' ? '📊 Open Analytics' : '🏠 Back to Home'}
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function MainApp() {
  const [platform, setPlatform] = useState<Platform>('web');
  const [view, setView] = useState<'home' | 'analytics'>('home');
  const { favorites, token, isPremium } = useAuth();
  const { t } = useLanguage();

  const [openLogin, setOpenLogin] = useState(false);

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Channel | null>(null);

  // Device & Network
  const [tier] = useState<DeviceTier>('HIGH');
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('EXCELLENT');
  const [networkType, setNetworkType] = useState<NetworkType>('WIFI');

  // Data
  const [allChannels, setAllChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<Channel>(MOCK_CHANNELS[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Player
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [metrics, setMetrics] = useState({ fps: 60, bitrate: '6.5 Mbps', buffer: '15s', resolution: '1080p' });

  // UI
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'live' | 'favorites' | 'search' | 'profile'>('home');
  const [mobileCategoryFilter, setMobileCategoryFilter] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAndroidCode, setShowAndroidCode] = useState(false);

  // ── Platform detection ──────────────────────────────────────────────────────
  useEffect(() => {
    setPlatform(detectPlatform());
    const handle = () => {
      const isMobile = window.innerWidth < 768;
      setPlatform(p => p === 'tv' ? 'tv' : isMobile ? 'mobile' : 'web');
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // ── Network detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (!navigator.connection) return;
      const { type, effectiveType, downlink } = navigator.connection;
      setNetworkType(type === 'cellular' || effectiveType?.includes('g') ? 'CELLULAR' : 'WIFI');
      if (downlink !== undefined)
        setNetworkQuality(downlink < 2 ? 'POOR' : downlink < 10 ? 'MODERATE' : 'EXCELLENT');
    };
    update();
    navigator.connection?.addEventListener('change', update);
    return () => navigator.connection?.removeEventListener('change', update);
  }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchChannels = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/live-channels');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.channels?.length > 0) {
        // 🔒 GOD MODE: Scrub sensitive fields before storing in state
        const scrubbed = data.channels.map((ch: any) => {
          const { streamUrl, streamSources, sources, ...rest } = ch;
          return rest;
        });
        const enriched = injectMockData(scrubbed);
        setAllChannels(enriched);
        setActiveChannel(prev => enriched.find(c => c.id === prev.id) ?? enriched[0]);
      } else throw new Error('empty');
    } catch {
      const enriched = injectMockData(MOCK_CHANNELS);
      setAllChannels(enriched);
      setActiveChannel(enriched[0]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };
  // ── Supabase Real-time ──────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Initial manual pull matching the structure
    const channelSub = supabase
      .channel('public:Channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Channel' }, (payload) => {
        console.log('Real-time change received!', payload);
        
        if (payload.eventType === 'UPDATE') {
          setAllChannels(prev => prev.map(ch => ch.id === payload.new.id ? { ...ch, ...payload.new } : ch));
        } else if (payload.eventType === 'INSERT') {
          setAllChannels(prev => {
            if (prev.find(c => c.id === payload.new.id)) return prev;
            return [...prev, payload.new as Channel];
          });
        } else if (payload.eventType === 'DELETE') {
          setAllChannels(prev => prev.filter(ch => ch.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { channelSub.unsubscribe(); };
  }, []);

  useEffect(() => { fetchChannels(); }, []);
  useEffect(() => {
    const id = setInterval(() => fetchChannels(true), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const webFiltered = useMemo(() => {
    let list = allChannels;
    if (activeCategory === 'Favoris') {
      list = list.filter(c => favorites.includes(c.id));
    } else if (activeCategory !== 'Tout') {
      list = list.filter(c => c.category.toLowerCase() === activeCategory.toLowerCase());
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return list;
  }, [allChannels, activeCategory, searchQuery, favorites]);

  const mobileFiltered = useMemo(() => {
    if (mobileCategoryFilter === 'Tout') return allChannels;
    if (mobileCategoryFilter === 'Sports') return allChannels.filter(c => ['Football', 'Basketball'].includes(c.category) || c.homeName);
    return allChannels.filter(c => c.category.toLowerCase() === mobileCategoryFilter.toLowerCase());
  }, [allChannels, mobileCategoryFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allChannels.forEach(c => { counts[c.category] = (counts[c.category] ?? 0) + 1; });
    if (token && favorites.length > 0) {
      counts['Favoris'] = favorites.length;
    }
    return counts;
  }, [allChannels, favorites, token]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedMatch(channel);
    setIsPlayerModalOpen(true);
    // Track history
    if (token) {
      fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channelId: channel.id })
      }).then(res => {
        if (!res.ok) return;
        return res.json();
      }).catch(() => {});
    }
  };

  // ── TV Layout (completely separate full-screen UI) ─────────────────────────
  if (platform === 'tv') {
    return (
      <>
        <TvLayout
          channels={allChannels}
          activeChannel={activeChannel}
          onSelect={handleChannelSelect}
          isLoading={isLoading}
          tier={tier}
          networkQuality={networkQuality}
          networkType={networkType}
        />
        <DevSwitcher platform={platform} onChange={setPlatform} view={view} onChangeView={setView} />
      </>
    );
  }

  // ── Mobile Layout ────────────────────────────────────────────────────────
  if (platform === 'mobile') {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-16">
        {/* Simple mobile header */}
        <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xs">SP</span>
            </div>
            <span className="text-base font-black text-white tracking-tight">StreamPerf</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
            {allChannels.length} EN DIRECT
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeMobileTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Featured player */}
              <div className="pt-4 pb-2">
                <MobilePlayerCard
                  channel={activeChannel}
                  isPlaying={isPlaying}
                  onPlay={() => setIsPlaying(p => !p)}
                />
              </div>

              {/* Quick picks label */}
              <div className="px-4 pt-4 pb-2">
                <h2 className="text-base font-black text-white">Tous les matchs</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{allChannels.length} chaînes en direct</p>
              </div>

              {/* Channel list */}
              <div className="bg-zinc-900/50 rounded-t-2xl mx-0 overflow-hidden border-t border-white/5">
                <MobileChannelList
                  channels={mobileFiltered}
                  activeChannel={activeChannel}
                  onSelect={handleChannelSelect}
                  isLoading={isLoading}
                  onRefresh={() => fetchChannels()}
                  activeCategory={mobileCategoryFilter}
                  onCategoryChange={setMobileCategoryFilter}
                />
              </div>
            </motion.div>
          )}

          {activeMobileTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-zinc-900/50 min-h-screen border-t border-white/5 mt-0">
              <MobileChannelList
                channels={mobileFiltered}
                activeChannel={activeChannel}
                onSelect={handleChannelSelect}
                isLoading={isLoading}
                onRefresh={() => fetchChannels()}
                activeCategory={mobileCategoryFilter}
                onCategoryChange={setMobileCategoryFilter}
              />
            </motion.div>
          )}

          {(activeMobileTab === 'favorites' || activeMobileTab === 'profile') && (
            <motion.div key={activeMobileTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-zinc-600 gap-3 px-6 text-center">
              <div className="text-5xl">{activeMobileTab === 'favorites' ? '⭐' : '👤'}</div>
              <p className="text-base font-bold text-zinc-400">
                {activeMobileTab === 'favorites' ? 'Vos favoris' : 'Mon profil'}
              </p>
              <p className="text-sm text-zinc-600">Bientôt disponible — connexion requise</p>
            </motion.div>
          )}

          {activeMobileTab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une chaîne ou un match..."
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 outline-none focus:border-emerald-500/50 text-sm font-medium"
              />
              {searchQuery && (
                <div className="mt-4 bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                  <MobileChannelList
                    channels={allChannels.filter(c =>
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.category.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    activeChannel={activeChannel}
                    onSelect={handleChannelSelect}
                    isLoading={false}
                    onRefresh={() => {}}
                    activeCategory="Tout"
                    onCategoryChange={() => {}}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav active={activeMobileTab} onChange={setActiveMobileTab} />

      </div>
    );
  }

  // ── Web Layout (Desktop) ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar onSearch={setSearchQuery} liveCount={allChannels.length} onOpenPremium={() => setOpenLogin(true)} />

      {/* 🚀 LIVE DASH TICKER (Premium Aesthetics) */}
      <div className="fixed top-20 left-0 right-0 z-30 overflow-hidden bg-emerald-500/10 backdrop-blur-md border-y border-white/5 py-1.5 pointer-events-none">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                DASHBOARD LIVE: {allChannels.length} CHANNELS OPTIMIZED
              </span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                QUALITY: 4K SELECT · LATENCY: {'<'} 1.2S · NODE: GLOBAL-EDGE
              </span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                DISPONIBLE SUR : WEB · MOBILE · ANDROID TV
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="min-h-screen px-0 pb-20">
        {view === 'analytics' ? (
          <div className="px-4 md:px-8 max-w-[1600px] mx-auto mt-32">
            <AnalyticsDashboard />
          </div>
        ) : (
          <>
            {/* 🎬 CINEMATIC HERO (Full Bleed) */}
            {activeCategory === 'Tout' && !searchQuery && (
              <div className="mb-12">
                <Hero 
                  channel={activeChannel}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  playbackRate={playbackRate}
                  setPlaybackRate={setPlaybackRate}
                  tier={tier}
                  networkQuality={networkQuality}
                  networkType={networkType}
                  metrics={metrics}
                  onMetricsUpdate={(m) => setMetrics(prev => ({ ...prev, ...m }))}
                />
              </div>
            )}

            <div className="px-4 md:px-8 max-w-[1600px] mx-auto mt-24">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {activeCategory === 'Tout' ? t('grid.all') : (activeCategory === 'Favoris' ? t('grid.favorites') : activeCategory)}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {isLoading ? '...' : `${webFiltered.length} ${webFiltered.length !== 1 ? 'channels' : 'channel'} ${t('grid.all').toLowerCase()}`}
                  </p>
                </div>
              </div>

              <RecommendationRow onSelect={handleChannelSelect} activeChannel={selectedMatch} />
              
              {!isPremium && <AdsBanner />}
              
              <CategoryFilter active={activeCategory} onChange={setActiveCategory} counts={categoryCounts} />
              
              <div className="mt-8 mb-16">
                {['Tout', 'Football', 'Basketball', 'Sports'].includes(activeCategory) ? (
                  <SportsDashboard 
                    channels={allChannels.filter(c => 
                      activeCategory === 'Tout' ? true : (activeCategory === 'Sports' ? (c.category === 'Sports' || c.category === 'Football') : c.category === activeCategory)
                    )} 
                    onSelect={handleChannelSelect} 
                  />
                ) : (
                  <ChannelGrid channels={webFiltered} activeChannel={activeChannel} onSelect={handleChannelSelect} isLoading={isLoading} />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-white/5 mt-16 py-8 px-6 text-center text-xs text-zinc-600">
        <p>StreamPerf Pro © {new Date().getFullYear()} — Multi-Platform Streaming Ecosystem</p>
        <p className="mt-1 opacity-50 italic">Professional Grade · Scalable · Secure</p>
      </footer>

      {showAndroidCode && <AndroidCodeViewer onClose={() => setShowAndroidCode(false)} />}
      
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        channel={selectedMatch}
        channels={allChannels}
        tier={tier}
        networkQuality={networkQuality}
        networkType={networkType}
      />

      {openLogin && <PremiumLoginModal onClose={() => setOpenLogin(false)} />}

      <DevSwitcher platform={platform} onChange={setPlatform} view={view} onChangeView={setView} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      <AuthModal />
    </AuthProvider>
  );
}
