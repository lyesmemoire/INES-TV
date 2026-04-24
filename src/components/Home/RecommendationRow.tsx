import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Channel } from '../../types';
import ChannelCard from './ChannelCard';
import { motion, AnimatePresence } from 'motion/react';

interface RecommendationRowProps {
  onSelect: (channel: Channel) => void;
  activeChannel: Channel | null;
}

export default function RecommendationRow({ onSelect, activeChannel }: RecommendationRowProps) {
  const [recommendations, setRecommendations] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (!res.ok) return; // Fix: Prevent parsing HTML as JSON
      const data = await res.json();
      if (data.status === 'ok') {
        setRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error('Failed to fetch recommendations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  if (!loading && recommendations.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-none uppercase">
              Recommandé pour vous
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Optimisé par Gemini AI · Basé sur votre historique
            </p>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <Loader2 className="animate-spin text-emerald-500 mr-2" size={20} />
              <span className="text-sm font-bold text-zinc-400">L'IA analyse vos préférences...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {recommendations.map((channel, i) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  index={i}
                  onClick={() => onSelect(channel)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
