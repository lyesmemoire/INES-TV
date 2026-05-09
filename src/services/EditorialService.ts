import { prisma } from '@/lib/prisma';
import { Channel } from '@/src/types';
import { Match, Stream, MatchStatus } from '@prisma/client';

export class EditorialService {
  private static cache: { data: any, timestamp: number } | null = null;
  private static CACHE_TTL = 30000; // 30 seconds for SEO stability
  private static pendingPromise: Promise<Channel[]> | null = null;

  /**
   * Dual-Source Logic for Featured Matches
   */
  static async getHeroMatches(locale: string = 'en'): Promise<Channel[]> {
    // ⚡ Fast Cache check
    if (this.cache && (Date.now() - this.cache.timestamp < this.CACHE_TTL)) {
      return this.cache.data;
    }

    // 🛡️ Thundering Herd Protection: deduplicate concurrent requests
    if (this.pendingPromise) {
      return this.pendingPromise;
    }

    this.pendingPromise = (async () => {
      try {
        const result = await this.fetchHeroMatchesData(locale);
        this.cache = { data: result, timestamp: Date.now() };
        return result;
      } finally {
        this.pendingPromise = null;
      }
    })();

    return this.pendingPromise;
  }

  private static async fetchHeroMatchesData(locale: string): Promise<Channel[]> {
    const fetchTask = (async () => {
      const now = new Date();
      let matches: any[] = [];

      // 1️⃣ Pin temporaire prioritaire
      matches = await prisma.match.findMany({
        where: { pinnedUntil: { gt: now } },
        orderBy: { featuredOrder: 'asc' },
        include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' } } },
        take: 3
      });

      // 2️⃣ Featured normal
      if (matches.length === 0) {
        const featured = await prisma.match.findMany({
          where: {
            isFeatured: true,
            OR: [{ featuredLocale: locale }, { featuredLocale: null }],
            AND: [
              { status: { not: MatchStatus.FINISHED } },
              { OR: [{ featuredUntil: null }, { featuredUntil: { gt: now } }] },
              { startTime: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
            ]
          },
          orderBy: { featuredOrder: 'asc' },
          include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' } } },
          take: 10
        });

        if (featured.length > 0) {
          matches = featured.sort((a, b) => {
            if (a.featuredLocale === locale && b.featuredLocale !== locale) return -1;
            if (b.featuredLocale === locale && a.featuredLocale !== locale) return 1;
            return 0;
          }).slice(0, 3);
        }
      }

      // 3️⃣ Auto Scored
      if (matches.length === 0) {
        matches = await this.getAutoFeatured(locale);
      }

      // 4️⃣ Fallback legacy
      const finalMatches = matches.length > 0 
        ? matches.map(m => this.normalizeMatch(m))
        : this.getLegacyMatches();

      return finalMatches;
    })();

    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("DB_TIMEOUT")), 2000)
    );

    try {
      return await Promise.race([fetchTask, timeout]);
    } catch (error: any) {
      console.error('[EDITORIAL ERROR] fetchHeroMatchesData failed or timed out:', error);
      // Fallback on real DB errors or timeout
      if (error.message === 'DB_TIMEOUT' || error.code === 'ECONNREFUSED' || error.code === 'P2024' || error.message.includes('Prisma')) {
        return this.getLegacyMatches();
      }
      return []; 
    }
  }

  /**
   * Moteur de scoring algorithmique pour déterminer les meilleurs matchs
   */
  private static async getAutoFeatured(locale: string) {
    const now = new Date();

    const matches = await prisma.match.findMany({
      where: {
        status: { notIn: [MatchStatus.CANCELLED, MatchStatus.FINISHED] },
        startTime: {
          gte: new Date(now.getTime() - 6 * 60 * 60 * 1000)
        }
      },
      take: 20,
      orderBy: { startTime: 'asc' },
      include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' } } }
    });

    const majorCompetitions = [
      'Champions League', 'Ligue 1', 'La Liga', 'Premier League', 'Coupe d’Afrique'
    ];
    
    const majorTeams = [
      'Paris Saint-Germain', 'Real Madrid', 'Barcelona', 'Manchester City', 'Al Ahly', 'Maroc', 'Algérie'
    ];

    const scored = await Promise.all(matches.map(async (match) => {
      let rankScore = 0;

      // 1. Statut Live
      if (match.status === MatchStatus.LIVE) rankScore += 50;

      // 2. Compétition majeure
      if (majorCompetitions.includes(match.competition)) rankScore += 30;

      // 3. Équipes majeures
      if (majorTeams.includes(match.homeTeam) || majorTeams.includes(match.awayTeam)) rankScore += 20;

      // 4. Proximité de l'heure du match
      const hoursToStart = (new Date(match.startTime).getTime() - now.getTime()) / 3600000;
      if (hoursToStart <= 2 && hoursToStart >= 0) rankScore += 10;

      // 5. Engagement (Plafonné pour éviter l'abus)
      rankScore += Math.min(match.viewCount * 0.01, 20);
      rankScore += Math.min(match.clickCount * 0.05, 40);

      // 6. 🔥 Trending Delta (Velocity)
      const trendScore = await this.calculateTrendScore(match.id);
      rankScore += trendScore;

      // 7. Décroissance temporelle (Decay)
      const hoursSinceStart = (now.getTime() - new Date(match.startTime).getTime()) / 3600000;
      if (hoursSinceStart > 2) rankScore -= 10;

      // 8. Popularité manuelle
      rankScore += match.popularityScore || 0;

      return { ...match, rankScore };
    }));

    // Trie par rankScore décroissant et prend les 3 meilleurs
    return scored.sort((a, b) => b.rankScore - a.rankScore).slice(0, 3);
  }

  /**
   * 📈 Calcul de la vélocité d'engagement (Trending)
   * Compare les deux derniers snapshots pour détecter une montée en puissance.
   */
  private static async calculateTrendScore(matchId: string): Promise<number> {
    try {
      const snapshots = await prisma.matchEngagementSnapshot.findMany({
        where: { matchId },
        orderBy: { createdAt: 'desc' },
        take: 2
      });

      if (snapshots.length < 2) return 0;

      const [latest, previous] = snapshots;
      const deltaViews = Math.max(0, latest.views - previous.views);
      const deltaClicks = Math.max(0, latest.clicks - previous.clicks);

      // 🛡️ Protection Anti-Manipulation (Cap sur le delta)
      if (deltaViews > 1000) return 0;

      // Calcul du score de tendance (Plafonné)
      const trendScore = 
        Math.min(deltaViews * 0.5, 40) + 
        Math.min(deltaClicks * 1.5, 60);

      return trendScore;
    } catch (err) {
      console.error(`[EDITORIAL] Trend calculation failed for ${matchId}:`, err);
      return 0;
    }
  }

  static async getMatchBySlug(slug: string) {
    try {
      const match = await prisma.match.findUnique({
        where: { slug },
        include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' } } }
      });
      if (!match) return null;
      return this.normalizeMatch(match);
    } catch (error) {
      console.error('[EDITORIAL ERROR] getMatchBySlug failed:', error);
      // Fallback for visual testing if DB is down
      const legacyMatches = this.getLegacyMatches();
      const fallback = legacyMatches.find(m => m.slug === slug) || legacyMatches[0];
      return {
        ...fallback,
        slug: slug // Ensure slug matches requested one
      };
    }
  }

  /**
   * Fetches matches based on various filters for SEO cluster pages.
   */
  static async getMatchesByFilter(filter: { 
    status?: MatchStatus[], 
    dateRange?: { start: Date, end: Date },
    competition?: string,
    team?: string,
    country?: string,
    take?: number
  }) {
    const { status, dateRange, competition, team, take = 20 } = filter;
    
    const where: any = {};
    if (status) where.status = { in: status };
    if (dateRange) where.startTime = { gte: dateRange.start, lte: dateRange.end };
    if (competition) where.competition = competition;
    if (team) {
      where.OR = [
        { homeTeam: { contains: team, mode: 'insensitive' } },
        { awayTeam: { contains: team, mode: 'insensitive' } }
      ];
    }
    
    try {
      const matches = await prisma.match.findMany({
        where,
        take,
        orderBy: { startTime: 'asc' },
        include: { streams: { where: { isActive: true }, orderBy: { priority: 'asc' } } }
      });

      return matches.map(m => this.normalizeMatch(m));
    } catch (error) {
      console.error('[EDITORIAL ERROR] getMatchesByFilter failed:', error);
      return [];
    }
  }

  /**
   * Normalizes a DB Match to the frontend Channel format
   */
  private static normalizeMatch(match: Match & { streams: Stream[] }): Channel {
    const firstStream = match.streams[0];
    
    return {
      id: match.id,
      name: `${match.homeTeam} vs ${match.awayTeam}`,
      category: 'football',
      logo: match.homeLogo || '',
      thumbnail: match.homeLogo || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
      homeName: match.homeTeam,
      awayName: match.awayTeam,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.competition,
      score: match.score || '0-0',
      status: match.status === MatchStatus.LIVE ? 'LIVE' : (match.status === MatchStatus.FINISHED ? 'FINISHED' : 'UPCOMING'),
      scheduledAt: match.startTime,
      streamUrl: firstStream?.url || '',
      viewers: Math.floor(Math.random() * 50000),
      isPremium: false,
      isActive: true,
      live: match.status === MatchStatus.LIVE,
      slug: match.slug,
      liveStats: {
        elapsedTime: match.status === MatchStatus.LIVE ? 'LIVE' : (match.status === MatchStatus.FINISHED ? 'FT' : 'UPCOMING')
      }
    };
  }

  /**
   * Legacy hardcoded matches (matches the previous app/api/home/matches content)
   */
  private static getLegacyMatches(): Channel[] {
    return [
      {
        id: "legacy-1",
        name: "PSG vs OM",
        logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
        thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        category: "football",
        homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
        awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
        score: "2-1",
        viewers: 45000,
        isPremium: false,
        liveStats: { elapsedTime: "LIVE" },
        live: true
      },
      {
        id: "legacy-2",
        name: "Real Madrid vs Barcelona",
        logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
        thumbnail: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
        streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        category: "football",
        homeLogo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
        awayLogo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
        score: "1-1",
        viewers: 120000,
        isPremium: true,
        liveStats: { elapsedTime: "LIVE" },
        live: true
      }
    ];
  }
}
