import { Channel, MatchData } from "@/src/types";

export function toChannel(match: any): Channel {
  return {
    id: match.id,
    name: match.title || match.name || "Live Match",
    
    // ✅ FIX: Never allow empty strings for images
    thumbnail: match.thumbnail || "/placeholder-match.jpg",
    streamUrl: match.streamUrl || null,
    category: match.category || "sports",

    // ✅ FIX: Logos must be valid URLs or null
    homeLogo: match.homeLogo || null,
    awayLogo: match.awayLogo || null,
    score: match.score || null,

    viewers: match.viewers || 0,
    isPremium: match.isPremium || false,
    currentProgram: match.currentProgram || null,

    liveStats: {
      elapsedTime: match.elapsedTime || "LIVE",
    },
  } as Channel;
}

export function toChannels(matches: any[]): Channel[] {
  if (!Array.isArray(matches)) return [];
  
  // ✅ FIX: Filter out invalid channels
  return matches
    .map(toChannel)
    .filter((c) => c.thumbnail && c.thumbnail !== ""); // Only valid thumbnails
}
