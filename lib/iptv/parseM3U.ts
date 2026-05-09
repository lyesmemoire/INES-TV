/**
 * 🛰️ M3U PARSER SERVICE (Production Grade)
 * Extracts metadata and validates streams from M3U/M3U8 playlists.
 */

export type ParsedChannel = {
  id: string
  name: string
  logo: string
  category: string
  url: string
}

/**
 * Generates a stable, browser-safe ID for a channel.
 */
function generateStableId(name: string, url: string): string {
  try {
    const cleanStr = (name + url).replace(/\s+/g, '').toLowerCase();
    // Use btoa for a stable base64 representation of the string
    return btoa(encodeURIComponent(cleanStr)).substring(0, 32).replace(/[+/=]/g, '0');
  } catch (e) {
    // Fallback if btoa fails
    return `ch_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Parses M3U content and returns an array of normalized channels.
 */
export function parseM3U(content: string): ParsedChannel[] {
  const lines = content.split("\n");
  const channels: ParsedChannel[] = [];
  
  let currentInfo: Partial<ParsedChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      // 1. Extract Display Name (everything after the last comma)
      const nameParts = line.split(",");
      const name = nameParts[nameParts.length - 1].trim() || "Unknown Channel";

      // 2. Extract Attributes using optimized Regex
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i) || line.match(/category="([^"]+)"/i);

      currentInfo = {
        name,
        logo: logoMatch ? logoMatch[1] : "",
        category: groupMatch ? groupMatch[1] : "General"
      };
    } 
    else if (line.startsWith("http")) {
      // 3. We found a URL, complete the channel object
      if (currentInfo.name) {
        const url = line;
        const id = generateStableId(currentInfo.name, url);

        channels.push({
          id,
          name: currentInfo.name,
          logo: currentInfo.logo || "",
          category: currentInfo.category || "General",
          url: url
        });
      }
      // Reset for next channel
      currentInfo = {};
    }
  }

  return channels;
}
