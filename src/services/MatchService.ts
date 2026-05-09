import { prisma } from '@/lib/prisma';
import { MatchStatus, Match } from '@prisma/client';

export class MatchService {
  /**
   * List matches with optional filters
   */
  static async getMatches(filters: { status?: MatchStatus } = {}) {
    return await prisma.match.findMany({
      where: filters,
      orderBy: { startTime: 'desc' },
      include: {
        _count: {
          select: { streams: true }
        }
      }
    });
  }

  /**
   * Get a single match by ID with its streams
   */
  static async getMatchById(id: string) {
    return await prisma.match.findUnique({
      where: { id },
      include: {
        streams: {
          orderBy: { priority: 'asc' }
        }
      }
    });
  }

  /**
   * Get a match by slug for public SEO pages
   */
  static async getMatchBySlug(slug: string) {
    return await prisma.match.findUnique({
      where: { slug },
      include: {
        streams: {
          where: { isActive: true },
          orderBy: { priority: 'asc' }
        }
      }
    });
  }

  /**
   * Create a new match with slug generation
   */
  static async createMatch(data: {
    homeTeam: string;
    awayTeam: string;
    competition: string;
    startTime: Date;
    status?: MatchStatus;
    score?: string;
    homeLogo?: string;
    awayLogo?: string;
    isFeatured?: boolean;
    featuredOrder?: number;
  }) {
    const slug = await this.generateUniqueSlug(data.homeTeam, data.awayTeam, data.competition);
    
    return await prisma.match.create({
      data: {
        ...data,
        slug,
      }
    });
  }

  /**
   * Update match details
   */
  static async updateMatch(id: string, data: Partial<Omit<Match, 'id' | 'createdAt' | 'updatedAt' | 'slug'>>) {
    const existing = await prisma.match.findUnique({ where: { id } });
    if (existing && data.status === "LIVE" && !existing.isFeatured && !existing.pinnedUntil) {
      data.isFeatured = true;
      data.featuredUntil = new Date(Date.now() + 3 * 60 * 60 * 1000);
    }

    if (data.status === "FINISHED") {
      data.isFeatured = false;
      data.featuredUntil = null;
      data.pinnedUntil = null;
    }

    return await prisma.match.update({
      where: { id },
      data
    });
  }

  /**
   * Delete match (streams are deleted by Prisma cascade)
   */
  static async deleteMatch(id: string) {
    return await prisma.match.delete({
      where: { id }
    });
  }

  /**
   * Robust slug generator
   * Format: home-vs-away-competition-live-stream
   */
  private static async generateUniqueSlug(home: string, away: string, competition: string): Promise<string> {
    const baseSlug = `${this.slugify(home)}-vs-${this.slugify(away)}-${this.slugify(competition)}-live-stream`;
    
    let slug = baseSlug;
    let count = 1;
    
    while (true) {
      const existing = await prisma.match.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${count++}`;
    }
    
    return slug;
  }

  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}
