export interface ParsedChannel {
  name: string;
  logo?: string;
  group?: string;
  url: string;
}

export function parseM3U(content: string): ParsedChannel[] {
  const lines = content.split("\n");
  const channels: ParsedChannel[] = [];

  let current: Partial<ParsedChannel> = {};

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.split(",")[1];
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      const groupMatch = line.match(/group-title="(.*?)"/);

      current = {
        name: nameMatch || "Unknown",
        logo: logoMatch?.[1],
        group: groupMatch?.[1],
      };
    }

    if (line.startsWith("http")) {
      channels.push({
        name: current.name || "Unknown",
        logo: current.logo,
        group: current.group,
        url: line,
      });

      current = {};
    }
  }

  return channels;
}
