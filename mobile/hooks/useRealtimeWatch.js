import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Listens for watch events on the server to notify mobile user
 * of what is currently playing on their associated TV device.
 */
export function useRealtimeWatch(userId) {
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("watch-sync")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "watch_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setLastEvent(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return lastEvent;
}
