'use client';

import React, { useState, useEffect } from 'react';
import { Channel } from '@/src/types';
import dynamic from 'next/dynamic';
import { Play, Clock } from 'lucide-react';

const PlayerModal = dynamic(
  () => import('@/src/components/Player/PlayerModal'),
  { ssr: false, loading: () => null }
);

interface MatchInteractiveLayerProps {
  match: Channel;
  allMatches: Channel[];
  isFr: boolean;
  children: (openModal: () => void) => React.ReactNode;
}

export default function MatchInteractiveLayer({ match, allMatches, isFr, children }: MatchInteractiveLayerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Network placeholders for PlayerModal
  const tier = 'HIGH';
  const networkQuality = 'EXCELLENT';
  const networkType = 'WIFI';

  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY';
  const isUpcoming = match.status === 'UPCOMING';
  const isEnded = match.status === 'FINISHED' || match.status === 'ENDED';

  if (isEnded) return null; // Hide sticky CTA if ended

  return (
    <>
      {children(() => setIsModalOpen(true))}

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-gradient-to-t from-black via-black/90 to-transparent md:hidden">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn--primary w-full shadow-2xl"
        >
          {isLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="btn-text">{isFr ? 'Regarder le Direct' : 'Watch Live'}</span>
            </>
          ) : isUpcoming ? (
            <>
              <Clock size={18} />
              <span className="btn-text">{isFr ? 'Regarder quand en direct' : 'Watch When Live'}</span>
            </>
          ) : (
            <span className="btn-text">{isFr ? 'Regarder' : 'Watch'}</span>
          )}
        </button>
      </div>

      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        channel={match}
        channels={allMatches}
        tier={tier}
        networkQuality={networkQuality}
        networkType={networkType}
      />
    </>
  );
}
