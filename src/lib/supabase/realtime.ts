import { supabase } from "./client";

export function subscribeTrending(callback: Function) {
  return supabase
    .channel("trending")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "trending_channels" },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
