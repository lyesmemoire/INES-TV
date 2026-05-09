/**
 * @module footballService
 * @description Couche de service pour les données football.
 * Utilisable directement dans les Server Components sans passer par HTTP interne.
 * Utilisable également dans les Route Handlers API pour les clients externes.
 */

import { prisma } from '@/lib/prisma'
import { MatchStatus, Match } from '@prisma/client'

export interface FootballMatch {
  id: string
  homeTeam: string
  awayTeam: string
  score: string
  minute: string
  status: 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SCHEDULED' | 'LIVE' | 'TIMED' | 'CANCELLED' | 'UPCOMING'
  league: string
  streamUrl?: string
  slug: string // Added for SEO
  scheduledAt?: string | Date
}

export interface FootballData {
  matches: FootballMatch[]
  fetchedAt: string
  source: 'live' | 'mock'
}

// ─── Données Mock ─────────────────────────────────────────────────────────────

const generateSlug = (home: string, away: string) => {
  return `${home.toLowerCase().replace(/\s+/g, '-')}-vs-${away.toLowerCase().replace(/\s+/g, '-')}-live-stream`
}

const MOCK_MATCHES: FootballMatch[] = [
  {
    id: '1',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Olympique de Marseille',
    score: '2-1',
    minute: '67',
    status: 'IN_PLAY',
    league: 'Ligue 1',
    streamUrl: 'https://example.com/stream/1',
    slug: generateSlug('Paris Saint-Germain', 'Olympique de Marseille')
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'FC Barcelona',
    score: '0-0',
    minute: '23',
    status: 'IN_PLAY',
    league: 'La Liga',
    streamUrl: 'https://example.com/stream/2',
    slug: generateSlug('Real Madrid', 'FC Barcelona')
  },
  {
    id: '3',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    score: '1-2',
    minute: '89',
    status: 'IN_PLAY',
    league: 'Premier League',
    streamUrl: 'https://example.com/stream/3',
    slug: generateSlug('Manchester City', 'Arsenal')
  },
  {
    id: '4',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    score: '3-1',
    minute: '45',
    status: 'PAUSED',
    league: 'Bundesliga',
    streamUrl: 'https://example.com/stream/4',
    slug: generateSlug('Bayern Munich', 'Borussia Dortmund')
  },
  {
    id: '5',
    homeTeam: 'Juventus',
    awayTeam: 'Inter Milan',
    score: '0-1',
    minute: '12',
    status: 'IN_PLAY',
    league: 'Serie A',
    streamUrl: 'https://example.com/stream/5',
    slug: generateSlug('Juventus', 'Inter Milan')
  },
]

// ─── Mapping API Externe ───────────────────────────────────────────────────────

interface ExternalAPIMatch {
  id: number
  homeTeam: { name: string }
  awayTeam: { name: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
  minute?: number
  status: string
  competition: { name: string }
  utcDate?: string
}

function mapExternalMatch(match: ExternalAPIMatch): FootballMatch {
  const homeScore = match.score.fullTime.home ?? 0
  const awayScore = match.score.fullTime.away ?? 0

  return {
    id: String(match.id),
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    score: `${homeScore}-${awayScore}`,
    minute: String(match.minute ?? 0),
    status: match.status as FootballMatch['status'],
    league: match.competition.name,
    slug: generateSlug(match.homeTeam.name, match.awayTeam.name),
    scheduledAt: match.utcDate
  }
}

// ─── Fonction Principale ───────────────────────────────────────────────────────

const FOOTBALL_API_URL = 'https://api.football-data.org/v4'

// ─── Cache Singleton (Pour limiter la charge API en production) ────────────────
let globalCache: { data: FootballData; expiresAt: number } | null = null

/**
 * Récupère les matchs en direct depuis l'API externe avec mise en cache multiniveau.
 * 
 * ✅ Appelable directement depuis un Server Component
 * ✅ Cache mémoire global (protection API)
 * ✅ Cache Next.js ISR (protection Serveur)
 * 
 * @param options.revalidate - Durée du cache Next.js en secondes (défaut: 30s)
 */
export async function fetchLiveMatches(
  options: { revalidate?: number } = {}
): Promise<FootballData> {
  const { revalidate = 30 } = options
  const now = Date.now()

  // 1. Check Global Cache (In-Memory)
  if (globalCache && now < globalCache.expiresAt) {
    return globalCache.data
  }

  const apiKey = process.env.FOOTBALL_API_KEY

  // Mode mock : pas de clé API configurée
  if (!apiKey) {
    return {
      matches: MOCK_MATCHES,
      fetchedAt: new Date().toISOString(),
      source: 'mock',
    }
  }

  try {
    // Mode live : appel direct à l'API externe
    const response = await fetch(`${FOOTBALL_API_URL}/matches`, {
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate },
    })

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[Football API] Failed with status ${response.status}: ${errorBody}`);
      // On ne jette pas d'erreur, on repasse en mock pour éviter de crash la Home
      return {
        matches: MOCK_MATCHES,
        fetchedAt: new Date().toISOString(),
        source: 'mock',
      };
    }

    const data = await response.json()
    const matches: FootballMatch[] = (data.matches ?? []).map(mapExternalMatch)

    const result: FootballData = {
      matches,
      fetchedAt: new Date().toISOString(),
      source: 'live',
    }

    // Update Global Cache (Grace period of 15 seconds)
    globalCache = {
      data: result,
      expiresAt: Date.now() + 15 * 1000
    }

    return result
  } catch (error) {
    console.error("[Football API] Critical connection failure:", error);
    return {
      matches: MOCK_MATCHES,
      fetchedAt: new Date().toISOString(),
      source: 'mock',
    };
  }
}

/**
 * Récupère les données d'un match spécifique via l'API externe.
 */
export async function fetchExternalMatch(externalId: string): Promise<FootballMatch> {
  const apiKey = process.env.FOOTBALL_API_KEY
  if (!apiKey) throw new Error("Missing FOOTBALL_API_KEY")

  const response = await fetch(`${FOOTBALL_API_URL}/matches/${externalId}`, {
    headers: {
      'X-Auth-Token': apiKey,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 0 } // No cache for individual sync
  })

  if (!response.ok) {
    throw new Error(`Football API error: ${response.status} ${response.statusText}`)
  }

  const match = await response.json()
  return mapExternalMatch(match)
}

/**
 * Synchronise le statut des matchs en base de données avec l'API réelle.
 */

export async function syncMatchStatusFromAPI() {
  const now = new Date()
  console.log(`[SYNC] Starting match synchronization at ${now.toISOString()}`)

  // Fenêtre de synchro : LIVE ou UPCOMING ayant démarré il y a moins de 24h
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { status: 'LIVE' },
        { status: 'UPCOMING' }
      ],
      startTime: {
        gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      },
      externalId: { not: null }
    } as any,
    take: 20, // Limit to prevent DB overload
    orderBy: { startTime: 'asc' }
  })

  let updatedCount = 0

  for (const match of matches as any[]) {
    if (!match.externalId) continue

    try {
      const apiData = await fetchExternalMatch(match.externalId)
      
      // Mapping API status to Prisma MatchStatus
      const statusMap: Record<string, MatchStatus> = {
        'IN_PLAY': 'LIVE',
        'PAUSED': 'LIVE',
        'FINISHED': 'FINISHED',
        'TIMED': 'UPCOMING',
        'SCHEDULED': 'UPCOMING',
        'CANCELLED': 'CANCELLED'
      }

      const newStatus = statusMap[apiData.status] || match.status

      if (newStatus !== match.status || apiData.score !== match.score) {
        console.log(`[SYNC] Updating ${match.homeTeam} vs ${match.awayTeam}: ${match.status} -> ${newStatus} (${apiData.score})`)
        
        const updateData: any = {
          status: newStatus,
          score: apiData.score
        }

        // Logic handled by MatchService.updateMatch, but we apply it here too for clarity or call MatchService
        // However, it's safer to use MatchService.updateMatch if it contains complex logic
        // But since we are already in a service, let's just make sure we handle the featured reset
        if (newStatus === 'FINISHED') {
          updateData.isFeatured = false
          updateData.featuredUntil = null
          updateData.pinnedUntil = null
        }

        await prisma.match.update({
          where: { id: match.id },
          data: updateData
        })
        
        updatedCount++
      }
    } catch (err: any) {
      console.error(`[SYNC ERROR] Failed to sync match ${match.id} (${match.homeTeam} vs ${match.awayTeam}):`, err)
    }
  }

  console.log(`[SYNC] Completed. Updated ${updatedCount} matches.`)
  return { updated: updatedCount }
}
