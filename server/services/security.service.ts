import { redis } from "./redis.service";
import { prisma } from "./db";

// ─── ABUSE DETECTION (IP-based) ────────────────────────────────────────────

/**
 * Détecte les abus basés sur l'IP (compteur Redis, seuil 50/min).
 * Utilisé dans /api/streams/play
 */
export async function detectAbuse(ip: string): Promise<boolean> {
  const key = `abuse:${ip}`;

  const count = await redis.incr(key);

  if (count === 1) {
    if (typeof redis.expire === "function") {
      await redis.expire(key, 60);
    }
  }

  return count > 50;
}

// ─── SECURITY SERVICE CLASS ────────────────────────────────────────────────

/**
 * Service de sécurité centralisé.
 * Utilisé par /api/admin/security/* routes.
 */
export class SecurityService {
  static async logEvent(data: {
    type: string;
    userId?: string;
    ip?: string;
    details?: string;
    severity?: string;
  }) {
    try {
      await prisma.securityEvent.create({
        data: {
          type: data.type,
          userId: data.userId || "SYSTEM",
          ip: data.ip || "0.0.0.0",
          details: data.details,
          severity: data.severity || "low",
        },
      });
    } catch (e) {
      console.error("[Security] logEvent error:", e);
    }
  }

  static async getStats() {
    const total = await prisma.securityEvent.count();

    const last24h = await prisma.securityEvent.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      total,
      last24h,
    };
  }

  static async getRecentLogs(limit = 50) {
    return prisma.securityEvent.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
