import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getUserFavorites } from "../services/personalizationService";

/**
 * Hook that listens to real-time intelligence events
 * and triggers alerts if a favorite team is involved.
 */
export function useIntelligenceWatcher(userId, onMomentsAlert) {
  useEffect(() => {
    if (!userId) return;

    let favorites = [];

    // 1. Fetch Favorites Initial State
    getUserFavorites(userId).then((data) => {
      favorites = data.map((f) => f.team_name.toLowerCase());
    });

    // 2. Subscribe to Intelligence Table
    const channel = supabase
      .channel("mobile-intelligence")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "intelligence_events",
        },
        (payload) => {
          const event = payload.new;
          const team = event.team?.toLowerCase();

          if (favorites.includes(team)) {
             onMomentsAlert({
               title: "⚽ BUT DE VOTRE ÉQUIPE !",
               body: `${event.team} vient de marquer à la ${event.minute}`,
               type: "GOAL"
             });
          } else if (event.importance_score >= 10) {
             onMomentsAlert({
               title: "🔥 MOMENT FORT LIVE",
               body: `Action majeure: ${event.event_type} sur le match de ${event.team}`,
               type: event.event_type
             });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
