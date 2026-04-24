import { prisma } from "../../services/db.js";

/**
 * 💰 ADMIN ADS SERVICE (AdX Control)
 * Industrial management for the House Ad inventory.
 */
export const AdminAdsService = {
  /**
   * 📋 LIST ALL HOUSE ADS
   */
  async listHouseAds() {
    return prisma.houseAd.findMany({
      orderBy: { priority: "desc" }
    });
  },

  /**
   * 🏗️ CREATE / RELOAD HOUSE AD
   */
  async upsertHouseAd(data: {
    id?: string,
    name: string,
    creativeUrl: string,
    priority: number,
    minPressure: number,
    maxPressure: number
  }) {
    return prisma.houseAd.upsert({
      where: { id: data.id || "new-ad" },
      create: {
        name: data.name,
        creativeUrl: data.creativeUrl,
        priority: data.priority,
        minPressure: data.minPressure,
        maxPressure: data.maxPressure
      },
      update: {
        name: data.name,
        creativeUrl: data.creativeUrl,
        priority: data.priority,
        minPressure: data.minPressure,
        maxPressure: data.maxPressure
      }
    });
  },

  /**
   * 🔴 DELETE HOUSE AD
   */
  async deleteHouseAd(id: string) {
    return prisma.houseAd.delete({ where: { id } });
  }
};
