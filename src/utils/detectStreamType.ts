// Re-export from the canonical source in parseM3U
export { type StreamType, type IPTVChannel } from "@/src/lib/iptv/parseM3U";

// Standalone detection function for use outside the parser
export type { StreamType as StreamTypeAlias } from "@/src/lib/iptv/parseM3U";

export type StreamTypeLocal = "hls" | "youtube" | "facebook" | "twitch" | "direct" | "unknown";

/**
 * detectStreamType
 * Automatically identifies the platform or protocol of a given URL.
 */
export const detectStreamType = (url: string): StreamTypeLocal => {
  const lowerUrl = url.toLowerCase();
  
  // HLS streams
  if (lowerUrl.includes(".m3u8") || lowerUrl.includes(".ts") || lowerUrl.includes("blob:")) {
    return "hls";
  }

  // YouTube — standard and shortened URLs, live and video links
  if (
    lowerUrl.includes("youtube.com/watch") ||
    lowerUrl.includes("youtube.com/live") ||
    lowerUrl.includes("youtube.com/embed") ||
    lowerUrl.includes("youtube.com/channel") ||
    lowerUrl.includes("youtube.com/@") ||
    lowerUrl.includes("youtu.be/")
  ) {
    return "youtube";
  }

  // Facebook — video, live, watch, reel, stories, shortened fb.watch
  if (
    lowerUrl.includes("facebook.com/video") ||
    lowerUrl.includes("facebook.com/watch") ||
    lowerUrl.includes("facebook.com/live") ||
    lowerUrl.includes("facebook.com/reel") ||
    lowerUrl.includes("facebook.com/stories") ||
    lowerUrl.includes("fb.watch/") ||
    lowerUrl.includes("fb.gg/")
  ) {
    return "facebook";
  }

  // Twitch
  if (lowerUrl.includes("twitch.tv")) {
    return "twitch";
  }

  // Direct HTTP(S) stream (mp4, webm, etc.)
  if (lowerUrl.match(/\.(mp4|webm|mkv|flv|avi)(\?|$)/)) {
    return "direct";
  }

  return "unknown";
};
