'use client';
import React, { useState, useEffect } from 'react';
import { MonitorPlay, Search, Bell, User, X, Globe, Shield, Smartphone } from 'lucide-react';
import DownloadAppModal from './DownloadAppModal';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Crown } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  onSearch?: (q: string) => void;
  liveCount?: number;
  onOpenPremium?: () => void;
}

export default function Navbar({ onSearch, liveCount = 0, onOpenPremium }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isPremium } = useAuth();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
        : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <MonitorPlay size={18} className="text-black font-bold" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white">
            Stream<span className="text-emerald-400">Perf</span>
          </span>
        </div>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { id: 'home', label: t('navbar.home') },
            { id: 'sport', label: t('navbar.sport') },
            { id: 'movies', label: t('navbar.movies') },
            { id: 'series', label: t('navbar.series') },
            { id: 'news', label: t('navbar.news') }
          ].map((item, i) => (
            <button
              key={item.id}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                i === 0
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className={`hidden md:flex items-center transition-all duration-300 ${searchOpen ? 'w-56' : 'w-9'}`}>
            {searchOpen ? (
              <div className="flex items-center w-full bg-white/10 border border-white/10 rounded-xl px-3 gap-2">
                <Search size={16} className="text-zinc-400 shrink-0" />
                <input
                autoFocus
                type="text"
                placeholder={t('navbar.search')}
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none py-2 w-full"
              />
                <button type="button" onClick={() => { setSearchOpen(false); setQuery(''); onSearch?.(''); }}>
                  <X size={14} className="text-zinc-400 hover:text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <Search size={18} />
              </button>
            )}
          </form>

          {/* Live badge */}
          {liveCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-100 text-[10px] font-black px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot shadow-[0_0_8px_#ef4444]" />
              {liveCount} {t('navbar.live')}
            </div>
          )}

          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-950" />
          </button>

          <button 
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-white/10 transition-colors uppercase text-[10px] font-black"
          >
            <Globe size={18} className="mr-1 hidden lg:block" />
            {language}
          </button>

          {!isPremium && (
            <button 
              onClick={() => onOpenPremium?.()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-[12px] font-black uppercase rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group shrink-0"
              title="Accès Premium"
            >
              <Crown size={18} className="group-hover:-translate-y-1 transition-transform" />
              <span className="hidden sm:inline">Premium</span>
            </button>
          )}

          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.1)] shrink-0">
               <Crown size={14} />
               <span className="hidden sm:inline">Membre Premium</span>
            </div>
          )}

          <button 
            onClick={() => setDownloadsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
            title="Télécharger l'application"
          >
            <Smartphone size={18} />
          </button>

          {user?.role === 'ADMIN' && (
            <Link 
              href="/admin/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              title="Accès Administrateur"
            >
              <Shield size={18} />
            </Link>
          )}

          <button 
            className="w-10 h-10 ml-2 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 opacity-40 cursor-default"
          >
            <User size={18} className="text-zinc-400" />
          </button>

          <DownloadAppModal isOpen={downloadsOpen} onClose={() => setDownloadsOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
