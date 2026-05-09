import { getSupabaseBrowserClient } from "./client";
import { subscribeOnce } from "@/src/lib/realtime/engine";

export function subscribeTrending(callback: Function) {
  const supabase = getSupabaseBrowserClient();
  return subscribeOnce("trending", () =>
    supabase
      .channel("trending")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trending_channels" },
        (payload: any) => callback(payload.new)
      )
      .subscribe()
  );
}
