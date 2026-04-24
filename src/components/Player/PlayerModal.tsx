'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Activity, Clock, Tv, Settings, BarChart2 } from 'lucide-react';
import { Channel } from '../../types';
import Player from './Player';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePlayer } from '../../hooks/usePlayer';
import { useTVRemote } from '../../hooks/useTVRemote';
import MiniEPG from './MiniEPG';
import { UltraPlayerRef } from './UltraPlayer';
import SettingsPanel from './UI/SettingsPanel';
import StatsForNerds from './UI/StatsForNerds';
import ErrorRecovery from './UI/ErrorRecovery';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  channels?: Channel[];
  tier: any;
  networkQuality: any;
  networkType: any;
}

export default function PlayerModal({ isOpen, onClose, channel, channels, tier, networkQuality, networkType }: PlayerModalProps) {
  const { t } = useLanguage();
  const { user, token, setAuthModalOpen } = useAuth();
  
  // ── Zapping Engine ──
  const targetChannels = channels?.length ? channels : (channel ? [channel] : []);
  const { currentChannel, nextChannel, prevChannel, next, prev, zapTo } = usePlayer(targetChannels, channel?.id || '');

  // ── UI States ──
  const [showUI, setShowUI] = useState(true);
  const [showMiniEPG, setShowMiniEPG] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hideUITimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Zapping Throttle ──
  const lastZap = useRef(0);
  const zapNext = () => {
    if (Date.now() - lastZap.current < 300) return;
    lastZap.current = Date.now();
    next();
    triggerUI();
    setHasError(false);
  };
  const zapPrev = () => {
    if (Date.now() - lastZap.current < 300) return;
    lastZap.current = Date.now();
    prev();
    triggerUI();
    setHasError(false);
  };

  const playerRef = useRef<UltraPlayerRef>(null);
  const triggerUI = () => {
    setShowUI(true);
    if (hideUITimeoutRef.current) clearTimeout(hideUITimeoutRef.current);
    hideUITimeoutRef.current = setTimeout(() => {
      setShowUI(false);
      setShowMiniEPG(false);
      setShowSettings(false);
    }, 5000);
  };

  useEffect(() => {
    if (isOpen) triggerUI();
    return () => {
      if (hideUITimeoutRef.current) clearTimeout(hideUITimeoutRef.current);
    };
  }, [isOpen, currentChannel?.id]);

  // ── Smart TV Binding (Context-Aware: Seek vs Zap + Long-press Stats) ──
  const enterHoldRef = useRef<number>(0);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (enterHoldRef.current === 0) {
        enterHoldRef.current = Date.now();
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const holdTime = Date.now() - enterHoldRef.current;
      enterHoldRef.current = 0;

      if (holdTime > 2000) {
        setShowDebug(p => !p);
      } else {
        if (!showUI) triggerUI();
        else setShowSettings(p => !p);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showUI]);

  useTVRemote({
    onLeft: () => {
      if (showUI && playerRef.current) {
        playerRef.current.handleSeek(-10);
      } else {
        zapPrev();
      }
    },
    onRight: () => {
      if (showUI && playerRef.current) {
        playerRef.current.handleSeek(10);
      } else {
        zapNext();
      }
    },
    onUp: () => setShowMiniEPG(true),
    onDown: () => {
      if (showUI && playerRef.current) {
        playerRef.current.zapToLive();
      } else {
        setShowMiniEPG(false);
      }
    },
    onSelect: () => {}, // Handled by manual keyup/keydown for long-press
  });

  if (!isOpen || !currentChannel) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10"
        onMouseMove={triggerUI}
        onTouchStart={triggerUI}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-[100dvh] md:max-w-7xl md:aspect-video md:h-auto bg-black md:rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] md:border border-white/10 flex flex-col md:flex-row"
        >
          {/* Main Video Area */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
            
            {/* Top Overlay */}
            <AnimatePresence>
              {showUI && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-0 left-0 right-0 z-[60] p-4 md:p-6 flex items-start justify-between bg-gradient-to-b from-black/90 to-transparent pointer-events-none"
                >
                  <div className="flex items-center gap-3">
                    {currentChannel.thumbnail && (
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/10 border border-white/20 p-2 backdrop-blur-md hidden md:block">
                        <img src={currentChannel.thumbnail} alt="logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-red-600 px-2 py-0.5 rounded flex items-center gap-1.5 text-[9px] font-black text-white uppercase shadow-red-600/30">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                        </div>
                        <h2 className="text-white font-black text-sm md:text-xl tracking-tight">{currentChannel.name}</h2>
                      </div>
                      <p className="text-zinc-300 font-medium text-[10px] md:text-sm drop-shadow line-clamp-1 max-w-[200px] md:max-w-md">
                        {currentChannel.currentProgram?.title || currentChannel.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pointer-events-auto">
                    <button 
                      onClick={() => setShowDebug(p => !p)} 
                      className={`p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all backdrop-blur-md ${showDebug ? 'text-emerald-500' : ''}`}
                    >
                      <BarChart2 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowSettings(p => !p)} 
                      className={`p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all backdrop-blur-md ${showSettings ? 'text-emerald-500' : ''}`}
                    >
                      <Settings size={16} />
                    </button>
                    <button onClick={() => setShowMiniEPG(p => !p)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all backdrop-blur-md hidden md:block">
                      <Tv size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-600/80 rounded-xl text-white transition-all backdrop-blur-md ml-4">
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PLAYER AREA */}
            <div className="w-full h-full aspect-video md:aspect-auto">
              <Player
                ref={playerRef}
                streamUrl={token ? `/api/streams/secure/${currentChannel.id}/index.m3u8` : undefined}
                streamUrls={(currentChannel.streamSources)?.map(s => s.url) || []}
                poster={currentChannel.logo || currentChannel.thumbnail}
                channelId={currentChannel.id}
                nextChannelId={nextChannel?.id}
                prevChannelId={prevChannel?.id}
                currentChannel={currentChannel}
                nextChannel={nextChannel}
                prevChannel={prevChannel}
                onOpenPremium={() => setAuthModalOpen(true)}
                onError={(msg) => setHasError(true)}
              />
            </div>

            {/* OVERLAYS & CONTROLS */}
            <StatsForNerds getStats={() => playerRef.current?.getStats()!} isOpen={showDebug} />
            
            <SettingsPanel 
              isOpen={showSettings} 
              onClose={() => setShowSettings(false)}
              levels={playerRef.current?.levels || []}
              currentLevel={playerRef.current?.currentLevel ?? -1}
              onSetLevel={(id) => {
                playerRef.current?.setQuality(id);
                triggerUI();
              }}
            />

            <ErrorRecovery 
              isVisible={hasError} 
              onRetry={() => {
                setHasError(false);
                zapTo(currentChannel.id);
              }} 
            />

            {/* Bottom Overlay Info */}
            <AnimatePresence>
              {showUI && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/95 to-transparent flex items-end justify-between gap-6 pointer-events-none"
                >
                  <div className="space-y-3 pointer-events-auto">
                    {currentChannel.score && currentChannel.homeLogo && currentChannel.awayLogo && (
                      <div className="flex items-center gap-2 md:gap-4 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 w-fit shadow-2xl">
                        <img src={currentChannel.homeLogo} alt="Home" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                        <span className="text-xl md:text-2xl font-black text-white tracking-widest">{currentChannel.score}</span>
                        <img src={currentChannel.awayLogo} alt="Away" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                      </div>
                    )}
                  </div>
                  
                  {/* Invisible Zapping Buttons for Mobile */}
                  <div className="absolute inset-y-20 left-0 w-1/4 z-10 pointer-events-auto" onClick={zapPrev} />
                  <div className="absolute inset-y-20 right-0 w-1/4 z-10 pointer-events-auto" onClick={zapNext} />

                  <button className="p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl transition-all pointer-events-auto hidden md:block">
                    <Maximize2 size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MINI EPG OVERLAY */}
            <AnimatePresence>
              {showMiniEPG && (
                <MiniEPG 
                  channels={targetChannels} 
                  currentChannelId={currentChannel.id} 
                  onSelect={(id) => {
                    zapTo(id);
                    triggerUI();
                  }} 
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
