import { supabase } from "@/src/lib/supabase/client";

type Params = {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  channel: string;
  onData: (payload: any) => void;
};

export function subscribeRealtime({
  table,
  event,
  channel,
  onData,
}: Params) {
  const sub = supabase
    .channel(channel)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
      },
      (payload) => onData(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(sub);
  };
}
