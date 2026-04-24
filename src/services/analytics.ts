import { supabase } from "@/lib/supabase";

type StreamEvent = {
  user_id?: string;
  channel_id: string;
  event_type: "start" | "error" | "rebuffer" | "switch" | "stop";
  cdn?: string;
  stream_url?: string;
  startup_time?: number;
  rebuffer_count?: number;
  rebuffer_duration?: number;
  error_count?: number;
  qoe_score?: number;
  metadata?: any;
};

/**
 * 📊 STREAM ANALYTICS SERVICE
 * Logs playback events and QoE metrics to Supabase for real-time monitoring and reporting.
 */
export const trackStreamEvent = async (event: StreamEvent) => {
  try {
    const { error } = await supabase.from("stream_events").insert([
      {
        ...event,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
  } catch (err) {
    console.warn("[Analytics] Failed to send event:", err);
  }
};
