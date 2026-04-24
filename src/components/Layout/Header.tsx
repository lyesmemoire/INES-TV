'use client';
import React from 'react';
import { MonitorPlay, Smartphone, Wifi, Activity, Code2, User as UserIcon, LogOut } from 'lucide-react';
import { DeviceTier, NetworkQuality, NetworkType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  tier: DeviceTier;
  setTier: (tier: DeviceTier) => void;
  networkQuality: NetworkQuality;
  setNetworkQuality: (quality: NetworkQuality) => void;
  networkType: NetworkType;
  isAutoNetwork: boolean;
  setIsAutoNetwork: (isAuto: boolean) => void;
  setShowAndroidCode: (show: boolean) => void;
}

export default function Header({
  tier, setTier, networkQuality, setNetworkQuality, networkType, isAutoNetwork, setIsAutoNetwork, setShowAndroidCode
}: HeaderProps) {
  const { user, isAuthenticated, setAuthModalOpen, logout } = useAuth();
  
  return (
    <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3 text-emerald-500">
        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <MonitorPlay size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          StreamPerf Pro
        </h1>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setShowAndroidCode(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all duration-300 border border-white/5 hover:border-white/10 shadow-lg hover:shadow-emerald-500/10"
        >
          <Code2 size={16} />
          <span className="hidden sm:inline">Code Android (Kotlin)</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
          {networkType === 'WIFI' ? <Wifi size={16} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" /> : <Smartphone size={16} className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" />}
          <span className="hidden md:inline font-medium">{networkType}</span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-xl">
          <span className="text-xs text-zinc-500 uppercase font-bold px-3 hidden xl:inline tracking-wider">Réseau</span>
          
          <button
            onClick={() => setIsAutoNetwork(!isAutoNetwork)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              isAutoNetwork 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 border-t border-white/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={16} />
            <span className="hidden lg:inline">AUTO</span>
          </button>

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          {(['POOR', 'MODERATE', 'EXCELLENT'] as NetworkQuality[]).map((n) => (
            <button
              key={n}
              onClick={() => {
                setIsAutoNetwork(false);
                setNetworkQuality(n);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                !isAutoNetwork && networkQuality === n 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 border-t border-white/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wifi size={16} className={n === 'POOR' ? 'opacity-40' : n === 'MODERATE' ? 'opacity-70' : ''} />
              <span className="hidden lg:inline">{n}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-xl">
          <span className="text-xs text-zinc-500 uppercase font-bold px-3 hidden xl:inline tracking-wider">Device</span>
          {(['LOW', 'MID', 'HIGH'] as DeviceTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                tier === t 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 border-t border-white/20' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'LOW' && <MonitorPlay size={16} className="opacity-50" />}
              {t === 'MID' && <Smartphone size={16} className="opacity-80" />}
              {t === 'HIGH' && <MonitorPlay size={16} />}
              <span className="hidden lg:inline">{t}</span>
            </button>
          ))}
        </div>

        {/* ── Auth Button ── */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold text-sm">
                <UserIcon size={16} />
                <span className="hidden sm:inline">{user?.name || user?.email}</span>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <UserIcon size={16} />
              <span className="hidden sm:inline">Se connecter</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
