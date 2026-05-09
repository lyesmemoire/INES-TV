"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function useRealtime(table: string, onInsert: (payload: any) => void) {
  const supabase = getSupabaseBrowserClient();
  const callbackRef = useRef(onInsert);

  useEffect(() => {
    callbackRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload: any) => {
          callbackRef.current(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, supabase]);
}
