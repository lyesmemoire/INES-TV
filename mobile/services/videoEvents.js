import { supabase } from "../lib/supabase";

/**
 * Records a watch event for the AI behavioral graph.
 * Only recorded if duration > 0 (filtered by backend/engine logic).
 */
export const recordWatchEvent = async (userId, channelId, duration) => {
  try {
    const { error } = await supabase
      .from("watch_events")
      .insert({
        user_id: userId,
        channel_id: channelId,
        watch_duration: Math.floor(duration),
      });

    if (error) throw error;
  } catch (error) {
    console.warn("TELEMETRY-FAIL:", error.message);
  }
};
