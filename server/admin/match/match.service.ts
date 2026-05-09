import { prisma } from "../../services/db.js";
import { generateMatchSlug } from "./slug.utils.js";
import type { MatchStatus } from "@prisma/client";

/**
 * 🏟️ MATCH SERVICE (Phase 1 — Progressive Migration)
 * 
 * CRUD complet pour l'entité Match dédiée.
 * Remplace le mock data de /api/admin/matches.
 * Coexiste avec Channel pendant la transition.
 */
export class MatchService {

  // ==========================================
  // 📝 CREATE
  // ==========================================

  /**
   * Crée un nouveau match avec auto-génération du slug.
   */
  static async createMatch(data: {
    homeTeam: string;
    awayTeam: string;
    competition: string;
    startTime: Date | string;
    status?: MatchStatus;
    score?: string;
    homeLogo?: string;
    awayLogo?: string;
    isFeatured?: boolean;
    featuredOrder?: number;
  }) {
    const startTime = new Date(data.startTime);

    // Generate unique slug
    const existingSlugs = (
      await prisma.match.findMany({ select: { slug: true } })
    ).map((m) => m.slug);

    const baseSlug = generateMatchSlug(
      data.homeTeam,
      data.awayTeam,
      data.competition,
      startTime
    );

    let slug = baseSlug;
    if (existingSlugs.includes(slug)) {
      let suffix = 2;
      while (existingSlugs.includes(`${baseSlug}-${suffix}`)) {
        suffix++;
      }
      slug = `${baseSlug}-${suffix}`;
    }

    return prisma.match.create({
      data: {
        slug,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        competition: data.competition,
        startTime,
        status: data.status || "UPCOMING",
        score: data.score || null,
        homeLogo: data.homeLogo || null,
        awayLogo: data.awayLogo || null,
        isFeatured: data.isFeatured || false,
        featuredOrder: data.featuredOrder ?? null,
      },
      include: { streams: true },
    });
  }

  // ==========================================
  // 📖 READ
  // ==========================================

  /**
   * Récupère un match par ID avec ses streams actifs.
   */
  static async getMatch(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        streams: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
      },
    });
  }

  /**
   * Récupère un match par slug (pour le SEO).
   */
  static async getMatchBySlug(slug: string) {
    return prisma.match.findUnique({
      where: { slug },
      include: {
        streams: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
      },
    });
  }

  /**
   * Liste paginée avec filtres.
   */
  static async listMatches(options?: {
    status?: MatchStatus;
    competition?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    orderBy?: "startTime" | "createdAt";
    order?: "asc" | "desc";
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.competition) where.competition = options.competition;
    if (options?.isFeatured !== undefined) where.isFeatured = options.isFeatured;

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          streams: {
            where: { isActive: true },
            orderBy: { priority: "asc" },
          },
        },
        orderBy: { [options?.orderBy || "startTime"]: options?.order || "desc" },
        skip,
        take: limit,
      }),
      prisma.match.count({ where }),
    ]);

    return {
      matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // ✏️ UPDATE
  // ==========================================

  /**
   * Met à jour un match existant.
   */
  static async updateMatch(
    id: string,
    data: {
      homeTeam?: string;
      awayTeam?: string;
      competition?: string;
      startTime?: Date | string;
      status?: MatchStatus;
      score?: string;
      homeLogo?: string;
      awayLogo?: string;
      isFeatured?: boolean;
      featuredOrder?: number | null;
    }
  ) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }

    return prisma.match.update({
      where: { id },
      data: updateData,
      include: { streams: true },
    });
  }

  // ==========================================
  // 🗑️ DELETE
  // ==========================================

  /**
   * Supprime un match et ses streams associés (cascade).
   */
  static async deleteMatch(id: string) {
    return prisma.match.delete({
      where: { id },
    });
  }

  // ==========================================
  // ⭐ FEATURED
  // ==========================================

  /**
   * Récupère les matchs à la une, triés par featuredOrder.
   * Exclut les matchs terminés/annulés.
   */
  static async getFeaturedMatches(limit = 3) {
    return prisma.match.findMany({
      where: {
        isFeatured: true,
        status: { notIn: ["FINISHED", "CANCELLED"] },
      },
      include: {
        streams: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: [
        { featuredOrder: "asc" },
        { startTime: "asc" },
      ],
      take: limit,
    });
  }

  /**
   * Pin/unpin un match à la une.
   */
  static async setFeatured(id: string, isFeatured: boolean, order?: number) {
    return prisma.match.update({
      where: { id },
      data: {
        isFeatured,
        featuredOrder: isFeatured ? (order ?? 0) : null,
      },
    });
  }

  // ==========================================
  // 📡 STREAM MANAGEMENT
  // ==========================================

  /**
   * Ajoute un stream à un match.
   */
  static async addStream(
    matchId: string,
    data: { type: string; url: string; priority?: number }
  ) {
    return prisma.stream.create({
      data: {
        matchId,
        type: data.type,
        url: data.url,
        priority: data.priority || 1,
        isActive: true,
        status: "UNKNOWN",
      },
    });
  }

  /**
   * Supprime un stream d'un match.
   */
  static async removeStream(streamId: string) {
    return prisma.stream.delete({
      where: { id: streamId },
    });
  }

  /**
   * Liste les streams d'un match.
   */
  static async getStreams(matchId: string) {
    return prisma.stream.findMany({
      where: { matchId, isActive: true },
      orderBy: { priority: "asc" },
    });
  }

  // ==========================================
  // 🧹 MAINTENANCE
  // ==========================================

  /**
   * Nettoie automatiquement les matchs terminés du featured.
   * Appelé par un cron ou manuellement.
   */
  static async cleanupFinishedFeatured() {
    const result = await prisma.match.updateMany({
      where: {
        isFeatured: true,
        status: { in: ["FINISHED", "CANCELLED"] },
      },
      data: {
        isFeatured: false,
        featuredOrder: null,
      },
    });

    if (result.count > 0) {
      console.log(`[MatchService] Cleaned ${result.count} finished featured matches.`);
    }

    return result;
  }
}
