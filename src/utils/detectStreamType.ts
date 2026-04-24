export type StreamType = "hls" | "youtube" | "facebook" | "twitch" | "unknown";

/**
 * detectStreamType
 * Automatically identifies the platform or protocol of a given URL.
 */
export const detectStreamType = (url: string): StreamType => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes(".m3u8") || lowerUrl.includes(".ts") || lowerUrl.includes("blob:")) {
    return "hls";
  }

  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return "youtube";
  }

  if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.watch")) {
    return "facebook";
  }

  if (lowerUrl.includes("twitch.tv")) {
    return "twitch";
  }

  return "unknown";
};
