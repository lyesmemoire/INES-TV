import { supabaseAdmin } from "./supabase-server"
import type { Channel } from "@/types/channel"
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
    .limit(1000)

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

import { prisma } from "./prisma"

export async function getChannelsFromDB(): Promise<Channel[]> {
  try {
    const data = await retry(fetchChannels, 3, 500)
    const dbChannels = mapChannels(data);
    
    // Fetch FTA Channels from FreeChannel table
    const ftaChannelsData = await prisma.freeChannel.findMany({
      where: { isActive: true },
      include: { streams: true }
    });

    const ftaChannels: Channel[] = ftaChannelsData.map(ch => ({
      id: ch.id,
      name: ch.name,
      logo: ch.logo || "https://via.placeholder.com/200x100/1f2937/ffffff?text=No+Logo",
      category: ch.category,
      live: true,
      slug: ch.slug,
      streamUrl: ch.streams[0]?.url || ""
    }));

    // Fusionner les chaînes M3U locales, Supabase et FTA
    const mergedMap = new Map();
    [...fallbackChannels, ...dbChannels, ...ftaChannels].forEach(ch => {
      if (ch && ch.id) mergedMap.set(ch.id, ch);
    });
    
    return Array.from(mergedMap.values());
  } catch (error) {
    console.warn("Database unavailable, using fallback:", error)
    return fallbackChannels
  }
}
