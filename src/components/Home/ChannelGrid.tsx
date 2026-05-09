// src/components/Home/ChannelGrid.tsx
// Migration : ChannelCard → TVCard
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { TVCard, TVCardSkeleton } from '@/components/TVCard';

interface Channel {
  id:       string;
  name:     string;
  logo:     string;
  category: string;
  live?:    boolean;
}

interface ChannelGridProps {
  channels:   Channel[];
  isLoading?: boolean;
  onSelect?:  (channel: Channel) => void;
  lang:       string;
}

// Nombre de squelettes affichés pendant le chargement
const SKELETON_COUNT = 8;

export default function ChannelGrid({
  channels,
  isLoading = false,
  onSelect,
  lang,
}: ChannelGridProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // État chargement — grille de squelettes
  if (isLoading) {
    return (
      <section
        className="channel-grid"
        aria-label="Chargement des chaînes"
        aria-busy="true"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <TVCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  // État vide — message dans le DOM, jamais de grille vide
  if (!channels || channels.length === 0) {
    return (
      <section className="channel-grid" aria-label="Grille des chaînes">
        <p className="channel-grid__empty">
          Aucune chaîne disponible pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section
      className="channel-grid"
      aria-label={`${channels.length} chaînes disponibles`}
    >
      {channels.map((channel) => (
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
    </section>
  );
}
