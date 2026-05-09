"use client";

import { useState, useEffect } from "react";
import { Menu, ChevronDown, MonitorPlay, Search, Bell, User, X, Globe, Shield, Smartphone, Crown } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import DownloadAppModal from "@/src/components/Layout/DownloadAppModal";

export function Navbar({ lang }: { lang?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const { user, isPremium, setAuthModalOpen } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <header className={`nav-bar fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="flex items-center gap-8">
        <button 
          className="nav-hamburger" 
          aria-label="Menu principal"
          style={{ display: 'block' }} // Force display for this specific layout
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform group-hover:scale-110">
            <MonitorPlay size={18} className="text-white font-bold" />
          </div>
          <div 
            className="italic" 
            style={{ 
              color: 'var(--color-text-primary)', 
              fontWeight: 900, 
              fontSize: 'var(--font-size-xl)', 
              letterSpacing: '-0.05em' 
            }}
          >
            GOALA TV
          </div>
        </Link>

        <nav className="nav-items nav-items--desktop">
          <Link href={`/${lang}`} className="nav-link" aria-current="page">
            {t('navbar.home')}
          </Link>
          <button className="nav-link flex items-center gap-1">
            {t('navbar.sport')} <ChevronDown className="w-4 h-4" />
          </button>
          <Link href={`/${lang}/live`} className="nav-link">
            {t('navbar.live')}
          </Link>
        </nav>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 hover:bg-white/10 transition-colors uppercase text-[10px] font-black"
          title="Change Language"
        >
          <Globe size={18} className="mr-1 hidden lg:block" />
          {language}
        </button>

        <button 
          onClick={() => setDownloadsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
          title="Télécharger l'application"
        >
          <Smartphone size={18} />
        </button>

        {!isPremium ? (
          <button 
            onClick={() => setAuthModalOpen(true)}
            className="btn btn--primary flex items-center gap-2" 
            style={{ minWidth: 'auto', padding: '0.5rem 1.25rem' }}
          >
            <Crown size={16} />
            <span className="hidden sm:inline">Premium</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-black uppercase shadow-[0_0_15px_rgba(220,38,38,0.1)]">
             <Crown size={14} />
             <span className="hidden sm:inline">Membre Premium</span>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <Link 
            href="/admin"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
            title="Admin Dashboard"
          >
            <Shield size={18} />
          </Link>
        )}

        <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors opacity-60">
          <User size={18} className="text-zinc-400" />
        </button>
      </div>

      <DownloadAppModal isOpen={downloadsOpen} onClose={() => setDownloadsOpen(false)} />
    </header>
  );
}


