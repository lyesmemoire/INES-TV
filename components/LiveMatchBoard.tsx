// components/LiveMatchBoard.tsx
// INES TV Design System — Migration finale
// ─────────────────────────────────────────────────────

'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import StreamCard               from '@/components/StreamCard';
import type {
  FootballData,
  FootballMatch,
} from '@/src/lib/footballService';

interface LiveMatchBoardProps {
  initialData:      FootballData;
  pollingInterval?: number;
}

const DEFAULT_POLLING_INTERVAL = 30_000;

export function LiveMatchBoard({
  initialData,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
}: LiveMatchBoardProps) {
  const [matches, setMatches] = useState<FootballMatch[]>(
    initialData.matches
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refreshMatches = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsRefreshing(true);

    try {
      const response = await fetch('/api/football', {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);

      const data: FootballData = await response.json();
      setMatches(data.matches ?? []);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Impossible de rafraîchir les données', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMatches, pollingInterval);
    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [refreshMatches, pollingInterval]);

  // État vide
  if (!matches || matches.length === 0) {
    return (
      <section
        className="live-match-board"
        aria-label="Matchs en direct"
      >
        <p className="live-match-board__empty">
          Aucun match en direct pour le moment.
        </p>
      </section>
    );
  }

  return (
    <section
      className="live-match-board"
      aria-label={`${matches.length} match${matches.length > 1 ? 's' : ''} en direct`}
      aria-busy={isRefreshing}
    >
      {/* En-tête compteur */}
      <div className="live-match-board__header">
        <p className="live-match-board__count">
          <span
            className="live-match-board__live-dot"
            aria-hidden="true"
          />
          {matches.length} match{matches.length > 1 ? 's' : ''} en direct
        </p>

        {/* Indicateur de rafraîchissement — visible uniquement en cours */}
        {isRefreshing && (
          <span
            className="live-match-board__refreshing"
            role="status"
            aria-live="polite"
          >
            Mise à jour…
          </span>
        )}
      </div>

      {/* Grille des matchs */}
      <div className="live-match-board__grid">
        {matches.map((match) => (
          <StreamCard
            key={match.id}
            href={`/watch/${match.id}`}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            score={match.score}
            minute={match.minute}
            status={match.status}
            league={match.league}
            streamUrl={match.streamUrl}
          />
        ))}
      </div>
    </section>
  );
}
