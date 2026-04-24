import { useQuery } from "@tanstack/react-query";
import { supabase } from "../services/supabase";
import { EPGProgram } from "../types/epg";
import { getWindowRange } from "../engine/timeWindow";

/**
 * 📡 ZERO BANDWIDTH EPG DATA HOOK (TiviMate Grade)
 * Fetches raw EPG programs and enforces a strict caching policy.
 * Layout is calculated at the component level for maximum 60fps fluidity.
 */
export function useEPGGrid(channelIds: string[]) {
  return useQuery({
    queryKey: ["epg-data", channelIds.sort().join(",")],
    queryFn: async () => {
      // 📐 Define the fetch window (consistent with engine logic)
      const { start, end } = getWindowRange(Date.now());
      
      console.log("\x1b[35m[EPG TiviMate-Grade]\x1b[0m Syncing raw program data...");
      
      const { data, error } = await supabase
        .from("epg_programs")
        .select("*")
        .in("channel_id", channelIds)
        .gte("end_time", start.toISOString())
        .lte("start_time", end.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      if (!data) return {};

      // Group raw programs by channel ID
      const grouped: Record<string, EPGProgram[]> = {};
      data.forEach((p) => {
        if (!grouped[p.channel_id]) grouped[p.channel_id] = [];
        grouped[p.channel_id].push(p);
      });

      return grouped;
    },
    // 🛡️ ZERO BANDWIDTH POLICY
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week persistence
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
}
