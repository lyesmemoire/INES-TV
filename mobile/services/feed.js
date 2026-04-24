import { supabase } from "../lib/supabase";

/**
 * Fetches the intelligent AI feed from the Supabase Edge Function.
 * Returns { continueWatching, recommended, trending }
 */
export const fetchHomeFeed = async (userId) => {
  try {
    const { data, error } = await supabase.functions.invoke("tv-os-feed", {
      body: { userId },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("AI-FEED-ERROR:", error);
    return null;
  }
};
