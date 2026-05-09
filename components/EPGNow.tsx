"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function EPGNow({ channelId }: { channelId: string }) {
  const [program, setProgram] = useState<any>(null)
  const [nextProgram, setNextProgram] = useState<any>(null)

  useEffect(() => {
    if (!channelId) return

    async function fetchEPG() {
      const now = new Date().toISOString()

      // Fetch current program
      const { data: currentData } = await supabase
        .from("epg_programs")
        .select("*")
        .eq("channel_id", channelId)
        .lte("start_time", now)
        .gte("end_time", now)
        .limit(1)

      if (currentData && currentData.length > 0) {
        setProgram(currentData[0])
      }

      // Fetch next program
      const { data: nextData } = await supabase
        .from("epg_programs")
        .select("*")
        .eq("channel_id", channelId)
        .gt("start_time", now)
        .order("start_time", { ascending: true })
        .limit(1)

      if (nextData && nextData.length > 0) {
        setNextProgram(nextData[0])
      }
    }

    fetchEPG()
    const interval = setInterval(fetchEPG, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [channelId])

  if (!program) return null

  return (
    <div className="w-full bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 mt-4 flex justify-between items-center text-sm">
      <div className="flex flex-col">
        <span className="text-red-500 font-bold uppercase text-xs mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          En Direct
        </span>
        <span className="text-white font-medium text-lg">{program.title}</span>
        {program.description && <span className="text-zinc-400 mt-1">{program.description}</span>}
      </div>
      
      {nextProgram && (
        <div className="flex flex-col text-right pl-4 border-l border-white/10">
          <span className="text-zinc-500 uppercase text-xs mb-1">À Suivre</span>
          <span className="text-zinc-300">{nextProgram.title}</span>
          <span className="text-zinc-500 text-xs mt-1">
            {new Date(nextProgram.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  )
}
