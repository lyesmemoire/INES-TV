"use client"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client"

export function useChannelsByCategory() {
  const [groups, setGroups] = useState<Record<string, any[]>>({})
  
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data } = await supabase
        .from("channels")
        .select("*")
        .limit(100)
        .range(0, 100)

      const grouped: Record<string, any[]> = {}
      data?.forEach((c) => {
        const key = c.group_name || "Autres"
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(c)
      })
      setGroups(grouped)
    }
    fetchData()
  }, [])
  
  return groups
}
