import { useEffect, useState } from "react";
import { subscribeTrending } from "@/src/lib/supabase/realtime";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function useTrending() {
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // Initial fetch
    supabase.from("trending_channels").select("score, zap_count, channels(name)").order('score', { ascending: false }).limit(15).then(({ data }) => {
      setTrending(data || []);
    });

    // Sub to Postgres WebSockets changes
    const sub = subscribeTrending((data: any) => {
      setTrending((prev) => {
        // Just as an example: we push the new event so the graph changes visually
        return [data, ...prev].slice(0, 15);
      });
    });

    return () => { sub.unsubscribe() };
  }, []);

  return { trending };
}
