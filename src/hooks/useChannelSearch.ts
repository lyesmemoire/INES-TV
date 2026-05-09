"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client"

/**
 * 🔍 useChannelSearch Hook
 * Handles real-time search against the Supabase "Channel" table.
 */
export function useChannelSearch(query: string) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      const supabase = getSupabaseBrowserClient()
      
      // ⚠️ FIX: Table name must be "Channel" (PascalCase) to match DB and Prisma
      const { data, error } = await supabase
        .from("Channel")
        .select("*")
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`) // ilike for better matching
        .eq("isActive", true)
        .limit(10)
      
      if (!error && data) {
        setResults(data)
      } else if (error) {
        console.error("[useChannelSearch] Search Error:", error)
      }
      
      setLoading(false)
    }

    const delay = setTimeout(search, 300)
    return () => clearTimeout(delay)
  }, [query])

  return { results, loading }
}
