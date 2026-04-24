import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook that listens to the AI Ranked Feed (v13 Self-Learning Engine).
 */
export function useHomeFeed(userId) {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      const { data, error } = await supabase.functions.invoke("tv-os-feed", {
        body: { userId },
      });
      if (error) throw error;
      setFeed(data);
    } catch (e) {
      console.error("Error loading feed:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;

    loadFeed();

    // ⚡ Real-time Sync: Refresh feed on any relevant DB changes
    const channel = supabase
      .channel("feed-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "watch_events" },
        () => loadFeed()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictive_events" },
        () => loadFeed()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { feed, loading, refresh: loadFeed };
}
