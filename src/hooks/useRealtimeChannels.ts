"use client"
import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client"

export function useRealtimeChannels(onInsert: (c: any) => void) {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("channels_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "channels" },
        (payload) => onInsert(payload.new)
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onInsert])
}
