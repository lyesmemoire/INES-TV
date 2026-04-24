import React from 'react';
import { motion } from 'motion/react';
import { Activity, ChevronDown, ChevronUp, Calendar, Clock, Star, RefreshCw, AlertTriangle } from 'lucide-react';
import { Channel, DeviceTier } from '../../types';

interface ChannelListProps {
  channels: Channel[];
  activeChannel: Channel;
  setActiveChannel: (c: Channel) => void;
  expandedChannelId: string | null;
  setExpandedChannelId: (id: string | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchChannels: () => void;
  tier: DeviceTier;
  handleScroll: () => void;
  isHoveringRef: React.MutableRefObject<boolean>;
}

const getCategoryColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'football': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
    case 'basketball': return 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
    case 'news': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
    case 'movies': return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]';
    case 'music': return 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]';
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
};

export default function ChannelList({
  channels, activeChannel, setActiveChannel, expandedChannelId, setExpandedChannelId,
  isLoading, error, fetchChannels, tier, handleScroll, isHoveringRef
}: ChannelListProps) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-[600px] lg:h-[800px] shadow-2xl relative overflow-hidden">
      {/* Glow effect on top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
      
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20 z-10">
        <div>
          <h2 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>
            TV en direct
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium bg-white/5 inline-block px-2 py-0.5 rounded-full">
            {tier === 'LOW' ? 'LazyColumn (Simplifié)' : 'LazyColumn (Fluide)'}
          </p>
        </div>
        <button 
          onClick={fetchChannels}
          disabled={isLoading}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
        </button>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar relative z-10" 
        onScroll={handleScroll}
        onMouseEnter={() => { isHoveringRef.current = true; }}
        onMouseLeave={() => { isHoveringRef.current = false; }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="font-medium tracking-wide text-sm">Synchronisation des flux...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Erreur de connexion</h3>
            <p className="text-sm text-zinc-400 mb-6">{error}</p>
            <button 
              onClick={fetchChannels}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Réessayer
            </button>
          </div>
        ) : (
          channels.map((channel, idx) => {
            const ItemWrapper = tier === 'HIGH' ? motion.div : 'div';
            const itemProps = tier === 'HIGH' ? {
              initial: { opacity: 0, x: 20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: idx * 0.05, ease: "easeOut" }
            } : {};

            const isActive = activeChannel.id === channel.id;
            const isExpanded = expandedChannelId === channel.id;

            return (
              <ItemWrapper
                key={channel.id}
                {...itemProps as any}
                className={`p-3 rounded-xl flex flex-col gap-3 transition-all duration-300 ${
                  isActive 
                    ? 'bg-zinc-800/80 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] shadow-inner' 
                    : 'bg-black/20 hover:bg-zinc-800/50 border border-white/5 hover:border-white/10'
                }`}
              >
                <div 
                  className="flex gap-4 items-center cursor-pointer group"
                  onClick={() => setActiveChannel(channel)}
                >
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-zinc-950 shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                    {channel.homeLogo && channel.awayLogo ? (
                      <div className="flex items-center justify-between w-full px-2">
                        <img src={channel.homeLogo} alt="Home" className="w-9 h-9 object-contain drop-shadow-lg" />
                        <span className="text-[10px] font-black text-zinc-500">VS</span>
                        <img src={channel.awayLogo} alt="Away" className="w-9 h-9 object-contain drop-shadow-lg" />
                      </div>
                    ) : (
                      <img 
                        src={channel.thumbnail} 
                        alt={channel.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${tier === 'LOW' ? 'opacity-80' : ''}`}
                        loading="lazy"
                      />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg shadow-[inset_0_0_15px_rgba(16,185,129,0.5)]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className={`font-bold text-[15px] truncate transition-colors ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                      {channel.name}
                    </h4>
                    {channel.score && <div className="text-xl font-black text-white tracking-widest mt-0.5">{channel.score}</div>}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider truncate max-w-[120px] ${getCategoryColor(channel.category)}`}>
                        {channel.category}
                      </span>
                      <span className="text-[11px] text-red-500 flex items-center gap-1.5 font-bold shadow-sm bg-red-500/10 px-2 py-0.5 rounded-md">
                        <Activity size={10} className="animate-pulse" /> {channel.viewers}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedChannelId(isExpanded ? null : channel.id);
                    }}
                    className={`p-2 rounded-lg transition-colors border border-transparent ${isExpanded ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white hover:border-white/10'}`}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-1 pt-4 border-t border-white/10 flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Schedule */}
                    {channel.schedule && channel.schedule.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {channel.schedule.find(s => s.isLive) && (
                          <div className="bg-gradient-to-br from-zinc-900 to-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden shadow-lg shadow-emerald-500/5">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-wider font-black flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></span>
                                En direct
                              </span>
                              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-md">
                                <Clock size={12} /> {channel.schedule.find(s => s.isLive)?.time}
                              </span>
                            </div>
                            <h6 className="text-[15px] font-bold text-white mb-2 leading-tight">
                              {channel.schedule.find(s => s.isLive)?.title}
                            </h6>
                            <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {channel.schedule.find(s => s.isLive)?.description}
                            </p>
                            
                            {/* Live Stats */}
                            {channel.liveStats && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                {(channel.score || channel.homeLogo || channel.awayLogo) && (
                                  <div className="flex items-center justify-between mb-4 bg-black/60 border border-white/5 p-3 rounded-xl shadow-inner">
                                    <div className="flex items-center gap-4">
                                      {channel.homeLogo && <img src={channel.homeLogo} alt="Home" className="w-10 h-10 object-contain drop-shadow-xl p-1 bg-white/5 rounded-lg" />}
                                      <span className="text-2xl font-black text-white tracking-widest">{channel.score || '0 - 0'}</span>
                                      {channel.awayLogo && <img src={channel.awayLogo} alt="Away" className="w-10 h-10 object-contain drop-shadow-xl p-1 bg-white/5 rounded-lg" />}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                      <span className="text-sm font-black">{channel.liveStats.elapsedTime}</span>
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1.5">Joueurs clés</span>
                                    <span className="text-xs text-zinc-200 font-semibold">{channel.liveStats.keyPlayers.join(', ')}</span>
                                  </div>
                                  <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1.5">Prochain événement</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">{channel.liveStats.upcomingEvents[0]?.time}</span>
                                      <span className="text-xs text-zinc-200 font-semibold truncate">{channel.liveStats.upcomingEvents[0]?.description}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Calendar size={14} className="text-zinc-500" /> À suivre
                          </h5>
                          <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar snap-x">
                            {channel.schedule.filter(s => !s.isLive).map((slot, i) => (
                              <div key={i} className="flex-none w-56 bg-zinc-900/60 border border-white/5 rounded-xl p-4 snap-start group hover:bg-zinc-800 hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[11px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md shadow-sm">
                                    {slot.time}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 font-bold">{slot.duration}</span>
                                </div>
                                <h6 className="text-[13px] font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1 mb-1.5 leading-snug">
                                  {slot.title}
                                </h6>
                                <p className="text-[11px] text-zinc-400/80 line-clamp-2 leading-relaxed">
                                  {slot.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Highlights */}
                    {channel.highlights && channel.highlights.length > 0 && (
                      <div className="pt-2">
                        <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Star size={14} className="text-yellow-500/80" /> Replays & Extraits
                        </h5>
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                          {channel.highlights.map((highlight, i) => (
                            <div key={i} className="relative w-40 shrink-0 rounded-xl overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl hover:shadow-white/5">
                              <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-24 object-cover transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                                <span className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">{highlight.title}</span>
                              </div>
                              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                                <Clock size={10} /> {highlight.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ItemWrapper>
            );
          })
        )}
      </div>
    </div>
  );
}
