import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function useChannels() {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.from("Channel").select("*").then(({ data }) => {
      setChannels(data || []);
    });
  }, []);

  return { channels };
}
