// src/components/watch/RecommendationRow.tsx
// INES TV Design System — Migration finale (Version corrigée)
// ─────────────────────────────────────────────────────

'use client';

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Channel } from "@/src/types";
import { TVCard } from "@/components/TVCard";
import { motion } from "framer-motion";

interface Props {
  onSelect?: (channel: Channel) => void;
  activeChannel: Channel | null;
  lang: string;
}

// ✅ MOCK RECOMMENDATIONS (À remplacer par un appel API réel en production)
const MOCK_RECOMMENDATIONS: Channel[] = [
  {
    id: "rec-1",
    name: "Juventus vs AC Milan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Juventus_Logo.svg",
    thumbnail: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800",
    streamUrl: undefined,
    category: "football",
    homeLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Juventus_Logo.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    score: "1-0",
    viewers: 67000 as any,
    isPremium: true,
    currentProgram: null,
    liveStats: { elapsedTime: "LIVE" } as any,
    live: true
  },
  {
    id: "rec-2",
    name: "NBA All-Star Game",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/NBA_logo.svg",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    streamUrl: undefined,
    category: "basketball",
    homeLogo: undefined,
    awayLogo: undefined,
    score: "",
    viewers: 42000 as any,
    isPremium: false,
    currentProgram: null,
    liveStats: { elapsedTime: "LIVE" } as any,
    live: true
  },
];

export default function RecommendationRow({ onSelect, activeChannel, lang }: Props) {
  const [recommendations] = useState<Channel[]>(MOCK_RECOMMENDATIONS);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Correction : Ne jamais retourner null pour l'accessibilité
  if (recommendations.length === 0) {
    return (
      <section 
        className="recommendation-row"
        aria-label="Chaînes recommandées"
      >
        <p className="recommendation-row__empty">
          Aucune recommandation disponible pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section 
      className="recommendation-row"
      aria-label="Chaînes recommandées pour vous"
    >
      <div className="recommendation-row__header">
        <Sparkles size={18} className="recommendation-row__icon" aria-hidden="true" />
        <h2 className="recommendation-row__title">Recommandé pour vous</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="recommendation-row__grid"
      >
        {recommendations.map((channel) => (
          <TVCard
            key={channel.id}
            channel={channel}
            focused={focusedId === channel.id}
            onFocus={() => setFocusedId(channel.id)}
            lang={lang}
          />
        ))}
      </motion.div>
    </section>
  );
}
