import { supabaseAdmin } from "./supabase-server"
import type { Channel } from "./channels"
import { retry } from "./utils"

type SupabaseChannel = {
  id: string
  name: string
  logo: string | null
  category: string
  status: string | null
  streamUrl: string | null
  isActive: boolean
  description: string | null
  createdAt: string
}

async function fetchChannels(): Promise<SupabaseChannel[]> {
  const { data, error } = await supabaseAdmin
    .from("Channel")
    .select("*")
    .eq("isActive", true)
    .order("name")

  if (error) {
    throw new Error(`Supabase error: ${error.message}`)
  }

  return data as any
}

function mapChannels(data: SupabaseChannel[]): Channel[] {
  return data.map((ch) => ({
    id: ch.id,
    name: ch.name,
    logo: ch.logo || "https://via.placeholder.com/200x100/1f2937/ffffff?text=No+Logo",
    category: ch.category,
    live: ch.status === 'LIVE' || (ch as any).live === true,
    streamUrl: ch.streamUrl || "",
    description: ch.description || undefined,
    createdAt: ch.createdAt,
  }))
}

import { channels as fallbackChannels } from "./channels"

export async function getChannelsFromDB(): Promise<Channel[]> {
  try {
    const data = await retry(fetchChannels, 3, 500)
    return mapChannels(data)
  } catch (error) {
    console.warn("Supabase unavailable, using fallback:", error)
    return fallbackChannels
  }
}
