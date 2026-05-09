import { ParsedChannel } from "./parseM3U"
import { XtreamChannel } from "./parseXtream"

export type DBChannel = {
  id: string
  name: string
  logo: string
  category: string
}

export type DBStream = {
  channel_id: string
  url: string
  type: "m3u8" | "xtream" | "youtube" | "facebook"
  priority: number
}

/**
 * Normalize ANY source → DB format
 */
export function normalizeChannels(
  channels: (ParsedChannel | XtreamChannel)[],
  type: DBStream["type"]
): {
  channels: DBChannel[]
  streams: DBStream[]
} {
  const uniqueChannels = new Map<string, DBChannel>()
  const streams: DBStream[] = []

  for (const ch of channels) {
    if (!uniqueChannels.has(ch.id)) {
      uniqueChannels.set(ch.id, {
        id: ch.id,
        name: ch.name,
        logo: ch.logo,
        category: ch.category
      })
    }

    streams.push({
      channel_id: ch.id,
      url: ch.url,
      type,
      priority: 0
    })
  }

  return {
    channels: Array.from(uniqueChannels.values()),
    streams
  }
}
