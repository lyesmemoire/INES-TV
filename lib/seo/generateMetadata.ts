export async function generateMatchMetadata(slug: string) {
  // Extract teams from slug for better accuracy if needed, 
  // but usually we'd fetch the match data here in a real scenario.
  const teams = slug.replace('-live-stream', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const [home, away] = teams.split(' Vs ')

  return {
    title: home && away ? `${home} vs ${away} Live` : `${teams} Live Stream`,
    description: `Watch ${teams} live online. Real-time scores, lineups, and HD coverage on GOALA TV.`,
    openGraph: {
      title: home && away ? `🔴 LIVE: ${home} vs ${away}` : `🔴 LIVE: ${teams}`,
      description: `Watch the match live now on GOALA TV. No subscription required.`,
      type: "website",
      url: `https://goala.tv/match/${slug}`,
      siteName: "GOALA TV"
    },
    alternates: {
      canonical: `https://goala.tv/match/${slug}`
    },
    twitter: {
      card: "summary_large_image",
      title: home && away ? `⚽ ${home} vs ${away} - Live` : `⚽ ${teams} - Live`,
      description: `Live streaming now on GOALA TV`
    }
  }
}
