import { prisma } from "../../services/db.js";

/**
 * 👤 ADMIN USERS SERVICE
 * Industrial User Management for the SaaS OS.
 */
export const AdminUsersService = {
  /**
   * 📋 LIST SEGMENTED USERS
   */
  async listUsers(page = 1, plan?: string) {
    const limit = 30;
    return prisma.user.findMany({
      where: { plan: plan || undefined, deletedAt: null },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        isPremium: true,
        isBanned: true,
        createdAt: true
      }
    });
  },

  /**
   * 💎 UPGRADE / DOWNGRADE
   */
  async setPlan(userId: string, plan: "FREE" | "PREMIUM" | "PRO") {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        plan,
        isPremium: plan !== "FREE"
      }
    });
  },

  /**
   * 🚫 BAN / UNBAN
   */
  async setBanned(userId: string, isBanned: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isBanned }
    });
  }
};
