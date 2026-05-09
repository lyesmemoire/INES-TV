// src/components/Home/RecommendationRow.tsx
// INES TV Design System — Migration finale
// Framer Motion conservé — classes Tailwind éliminées
// ─────────────────────────────────────────────────────

'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 }          from 'lucide-react';
import { motion, AnimatePresence }     from 'framer-motion';
import { TVCard, TVCardSkeleton }      from '@/components/TVCard';
import type { Channel }                from '../../types';

interface RecommendationRowProps {
  onSelect?:      (channel: Channel) => void;
  activeChannel: Channel | null;
  lang:          string;
}

const SKELETON_COUNT  = 5;
const ANIMATION_VARIANTS = {
  hidden:  { opacity: 0, y: 8  },
  visible: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -8 },
} as const;

export default function RecommendationRow({
  onSelect,
  activeChannel,
  lang,
}: RecommendationRowProps) {
  const [recommendations, setRecommendations] = useState<Channel[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [focusedId, setFocusedId]             = useState<string | null>(null);

  const fetchRecs = async () => {
    try {
      const res = await fetch('/api/recommendations');
      if (!res.ok) return;
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
  }, [activeChannel]);

  return (
    <section
      className="recommendation-row"
      aria-label="Chaînes recommandées pour vous"
      aria-busy={loading}
    >
      {/* En-tête */}
      <div className="recommendation-row__header">
        <Sparkles
          size={18}
          aria-hidden="true"
          className="recommendation-row__icon"
        />
        <h2 className="recommendation-row__title">
          Recommandé pour vous
        </h2>
      </div>

      {/* Compteur — visible uniquement quand les données sont chargées */}
      {!loading && recommendations.length > 0 && (
        <p className="recommendation-row__count">
          {recommendations.length} chaîne
          {recommendations.length > 1 ? 's' : ''} sélectionnée
          {recommendations.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Grille animée */}
      <div className="recommendation-row__track">
        <AnimatePresence mode="wait">

          {/* État chargement */}
          {loading && (
            <motion.div
              key="loading"
              className="recommendation-row__grid"
              variants={ANIMATION_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* 
                Loader accessible :
                role="status" annonce l'activité au lecteur d'écran
                Les squelettes sont aria-hidden pour éviter la répétition
              */}
              <span className="sr-only" role="status">
                Chargement des recommandations…
              </span>
              <Loader2
                className="recommendation-row__loader"
                aria-hidden="true"
              />
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <TVCardSkeleton key={i} />
              ))}
            </motion.div>
          )}

          {/* État vide */}
          {!loading && recommendations.length === 0 && (
            <motion.p
              key="empty"
              className="recommendation-row__empty"
              variants={ANIMATION_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              Aucune recommandation disponible pour le moment.
            </motion.p>
          )}

          {/* État données */}
          {!loading && recommendations.length > 0 && (
            <motion.div
              key="grid"
              className="recommendation-row__grid"
              variants={ANIMATION_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {recommendations.map((channel) => (
                <TVCard
                  key={channel.id}
                  channel={channel}
                  focused={focusedId === channel.id}
                  onFocus={() => setFocusedId(channel.id)}
                  lang={lang}
                  onClick={(e) => {
                    if (onSelect) {
                      e.preventDefault();
                      onSelect(channel);
                    }
                  }}
                />
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
