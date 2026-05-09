"use client"

import React from 'react';
import { Home, Tv, Star, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/src/context/LanguageContext';

const TABS = [
  { key: 'home',      label: 'Accueil',   icon: Home,   href: '' },
  { key: 'live',      label: 'Live',      icon: Tv,     href: '/live' },
  { key: 'favorites', label: 'Favoris',   icon: Star,   href: '/favorites' },
  { key: 'search',    label: 'Recherche', icon: Search, href: '/search' },
  { key: 'profile',   label: 'Profil',    icon: User,   href: '/profile' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-stretch h-16">
        {TABS.map(({ key, label, icon: Icon, href }) => {
          const targetHref = `/${language}${href}`;
          const isActive = pathname === targetHref || (href === '' && pathname === `/${language}`);
          
          return (
            <Link
              key={key}
              href={targetHref}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                isActive ? 'text-red-500' : 'text-zinc-500 active:text-zinc-300'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold tracking-wide">
                {key === 'home' ? t('navbar.home') : label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
