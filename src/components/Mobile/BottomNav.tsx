import React from 'react';
import { Home, Tv, Star, Search, User } from 'lucide-react';

interface BottomNavProps {
  active: 'home' | 'live' | 'favorites' | 'search' | 'profile';
  onChange: (tab: 'home' | 'live' | 'favorites' | 'search' | 'profile') => void;
}

const TABS = [
  { key: 'home',      label: 'Accueil',   icon: Home },
  { key: 'live',      label: 'Live',      icon: Tv },
  { key: 'favorites', label: 'Favoris',   icon: Star },
  { key: 'search',    label: 'Recherche', icon: Search },
  { key: 'profile',   label: 'Profil',    icon: User },
] as const;

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 safe-area-pb">
      <div className="flex items-stretch h-16">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                isActive ? 'text-emerald-400' : 'text-zinc-500 active:text-zinc-300'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
