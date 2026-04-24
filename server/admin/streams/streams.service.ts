import { prisma } from "../../services/db.js";

/**
 * 📺 ADMIN STREAMS SERVICE (M3U Orchestration)
 * Industrial Stream Management with Mandatory Soft-Delete.
 */
export const AdminStreamsService = {
  /**
   * 📋 LIST ACTIVE STREAMS
   */
  async listActive() {
    return prisma.channel.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  },

  /**
   * 🏗️ ADD M3U URL / BATCH
   */
  async addM3U(url: string, category: string = "SPORTS") {
     console.log(`[Streams] Ingesting M3U from ${url}...`);
     // Implementation of M3U parsing would go here or call an existing tool
     return { success: true, url, category };
  },

  /**
   * 🗑️ SOFT DELETE CHANNEL
   * NEVER hard delete to preserve AdX historical continuity.
   */
  async softDelete(id: string) {
    return prisma.channel.update({
      where: { id },
      data: { 
        isActive: false,
        deletedAt: new Date()
      }
    });
  },

  /**
   * ♻️ RESTORE CHANNEL
   */
  async restore(id: string) {
    return prisma.channel.update({
      where: { id },
      data: { 
        isActive: true,
        deletedAt: null
      }
    });
  }
};
