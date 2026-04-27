import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useChannels() {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("Channel").select("*").then(({ data }) => {
      setChannels(data || []);
    });
  }, []);

  return { channels };
}
