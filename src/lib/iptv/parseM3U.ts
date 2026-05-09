export type StreamType = "hls" | "youtube" | "facebook" | "twitch" | "direct" | "unknown"

export type IPTVChannel = {
  id: string
  name: string
  url: string
  logo?: string
  group?: string
  tvgId?: string
  streamType: StreamType
}

function generateId(name: string, url: string) {
  try {
    return btoa(encodeURIComponent(name + url)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch (e) {
    return `id_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Detect the stream type from a URL.
 * Supports: HLS (.m3u8), YouTube, Facebook, Twitch, and direct HTTP streams.
 */
function detectStreamType(url: string): StreamType {
  const lower = url.toLowerCase()

  // HLS streams
  if (lower.includes(".m3u8") || lower.includes(".ts") || lower.includes("blob:")) {
    return "hls"
  }

  // YouTube — standard and shortened URLs, live and video links
  if (
    lower.includes("youtube.com/watch") ||
    lower.includes("youtube.com/live") ||
    lower.includes("youtube.com/embed") ||
    lower.includes("youtube.com/channel") ||
    lower.includes("youtube.com/@") ||
    lower.includes("youtu.be/")
  ) {
    return "youtube"
  }

  // Facebook — video, live, watch, reel, stories, shortened fb.watch
  if (
    lower.includes("facebook.com/video") ||
    lower.includes("facebook.com/watch") ||
    lower.includes("facebook.com/live") ||
    lower.includes("facebook.com/reel") ||
    lower.includes("facebook.com/stories") ||
    lower.includes("fb.watch/") ||
    lower.includes("fb.gg/")
  ) {
    return "facebook"
  }

  // Twitch
  if (lower.includes("twitch.tv")) {
    return "twitch"
  }

  // Direct HTTP(S) stream (mp4, webm, etc.)
  if (lower.match(/\.(mp4|webm|mkv|flv|avi)(\?|$)/)) {
    return "direct"
  }

  return "unknown"
}

/**
 * Check if a line is a valid stream URL.
 * Accepts standard http/https links as well as platform-specific URLs.
 */
function isStreamUrl(line: string): boolean {
  return (
    line.startsWith("http://") ||
    line.startsWith("https://") ||
    line.startsWith("rtmp://") ||
    line.startsWith("rtsp://")
  )
}

export function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split("\n")

  const channels: IPTVChannel[] = []
  let current: Partial<IPTVChannel> = {}

  for (let line of lines) {
    line = line.trim()

    if (line.startsWith("#EXTINF")) {
      // Extract name (usually after the last comma)
      const nameParts = line.split(",")
      const name = nameParts[nameParts.length - 1].trim() || "Unknown"

      const logo = match(line, /tvg-logo="([^"]+)"/)
      const group = match(line, /group-title="([^"]+)"/) || match(line, /category="([^"]+)"/)
      const tvgId = match(line, /tvg-id="([^"]+)"/)

      current = {
        name,
        logo,
        group,
        tvgId,
      }
    }

    // Accept any valid stream URL (http, https, rtmp, rtsp)
    if (isStreamUrl(line)) {
      current.url = line
      current.streamType = detectStreamType(line)
      current.id = generateId(current.name || "Unknown", line)

      // Auto-assign group for social platform streams if no group was set
      if (!current.group) {
        if (current.streamType === "youtube") {
          current.group = "YouTube Live"
        } else if (current.streamType === "facebook") {
          current.group = "Facebook Live"
        } else if (current.streamType === "twitch") {
          current.group = "Twitch"
        }
      }

      channels.push(current as IPTVChannel)
      current = {}
    }
  }

  return channels
}

function match(str: string, regex: RegExp) {
  const res = str.match(regex)
  return res ? res[1] : undefined
}
