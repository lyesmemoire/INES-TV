import { useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * ⚡ Unified Hook for the Central Orchestrator (v14).
 * Listen to UI actions dispatched by the OS Brain.
 */
export function useOrchestratedEvents(userId, onAction) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("mobile-orchestrator")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_actions",
        },
        (payload) => {
          const action = payload.new;
          
          // 🛡️ SECURITY: Only process global actions or actions targeting this user
          if (!action.target_user_id || action.target_user_id === userId) {
            onAction(action);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
