import { supabase } from "@/lib/supabase";

/**
 * 📊 ANALYTICS QUERIES
 * Fetches data for the dashboard from the stream_events table.
 */

export const getQoEStats = async () => {
  const { data, error } = await supabase
    .from("stream_events")
    .select("*");

  if (error) {
    console.error("[Analytics] Error fetching QoE stats:", error);
    return [];
  }
  return data || [];
};

export const getCDNStats = async () => {
  const { data, error } = await supabase
    .from("stream_events")
    .select("cdn, qoe_score, event_type");

  if (error) {
    console.error("[Analytics] Error fetching CDN stats:", error);
    return [];
  }
  return data || [];
};

export const getChannelStats = async () => {
  const { data, error } = await supabase
    .from("stream_events")
    .select("channel_id, event_type, qoe_score");

  if (error) {
    console.error("[Analytics] Error fetching channel stats:", error);
    return [];
  }
  return data || [];
};
