/**
 * 🛰️ PRO IPTV M3U PARSER (SaaS Edition)
 * Extraie les métadonnées enrichies (logo, groupe) pour une UX Premium.
 */
export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo: string | null;
  group: string | null;
}

export const parseM3U = (content: string): IPTVChannel[] => {
  const lines = content.split('\n');
  const channels: IPTVChannel[] = [];
  let current: Partial<IPTVChannel> | null = null;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      const groupMatch = line.match(/group-title="(.*?)"/);

      current = {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        logo: logoMatch ? logoMatch[1] : null,
        group: groupMatch ? groupMatch[1] : 'Other',
      };
    } else if (line.startsWith('http') && current) {
      current.url = line;
      // 🆔 Generate stable ID based on URL
      current.id = Buffer.from(line).toString('base64').slice(-16).replace(/[/+=]/g, '');
      channels.push(current as IPTVChannel);
      current = null;
    }
  }

  return channels;
};
