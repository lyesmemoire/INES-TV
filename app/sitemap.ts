import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

/**
 * 🌍 DYNAMIC SITEMAP GENERATOR (High Scale)
 * Automatically indexes matches, clusters, teams, and competitions.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://goala.tv'
  const locales = ['fr', 'en']
  
  // 1. Fetch Data (Optimized)
  let matches: any[] = []
  let ftaChannels: any[] = []

  try {
    matches = await prisma.match.findMany({
      select: { slug: true, updatedAt: true, homeTeam: true, awayTeam: true, competition: true },
      take: 2000, // Safe limit for standard sitemap
      orderBy: { startTime: 'desc' }
    })
    
    ftaChannels = await prisma.freeChannel.findMany({
      select: { id: true }
    })
  } catch (e) {
    console.error("Sitemap DB fetch failed:", e)
  }

  // Extract unique entities
  const teams = Array.from(new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam])))
  const competitions = Array.from(new Set(matches.map(m => m.competition)))

  const allUrls: MetadataRoute.Sitemap = []

  locales.forEach(lang => {
    const isFr = lang === 'fr'

    // 🏠 Home
    allUrls.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    })

    // 🚀 Clusters (Today & Live)
    const langClusters = isFr 
      ? ['football-aujourdhui', 'matchs-en-direct']
      : ['football-today', 'live-matches']
      
    langClusters.forEach(cluster => {
      allUrls.push({
        url: `${baseUrl}/${lang}/${cluster}`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 0.9,
      })
    })

    // ⚽ Matches
    matches.forEach(match => {
      allUrls.push({
        url: `${baseUrl}/${lang}/match/${match.slug}`,
        lastModified: match.updatedAt,
        changeFrequency: 'hourly',
        priority: 0.8,
      })
    })

    // 🛡️ Entities (Teams)
    teams.forEach(team => {
      const slug = team.toLowerCase().replace(/\s+/g, '-')
      allUrls.push({
        url: `${baseUrl}/${lang}/team/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      })
    })

    // 🏆 Entities (Competitions)
    competitions.forEach(comp => {
      const slug = comp.toLowerCase().replace(/\s+/g, '-')
      allUrls.push({
        url: `${baseUrl}/${lang}/competition/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      })
    })

    // 📺 FTA Channels
    ftaChannels.forEach(channel => {
      allUrls.push({
        url: `${baseUrl}/${lang}/tv/${channel.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    })
  })

  return allUrls
}
