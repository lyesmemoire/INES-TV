import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook that listens to anticipatory sports events (Predictive Engine).
 */
export function usePredictiveEvents(onPredictiveAlert) {
  useEffect(() => {
    const channel = supabase
      .channel("mobile-predictive")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "predictive_events",
        },
        (payload) => {
          const event = payload.new;
          if (event.event_type === "HIGH_PRESSURE") {
            onPredictiveAlert({
              title: "⚡ MOMENTUM EN HAUSSE",
              body: event.message,
              matchId: event.match_id
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
