import { prisma } from "./db.js";
import { LiveSourceType } from "@prisma/client";

export class LiveSourceRegistry {
  async addSource(data: {
    channelId: string;
    type: LiveSourceType;
    url: string;
    name?: string;
    apiKey?: string;
    apiSecret?: string;
    headers?: any;
    priority?: number;
  }) {
    return prisma.liveSource.create({
      data: {
        ...data,
        priority: data.priority ?? 0,
      }
    });
  }

  async getSources(channelId: string) {
    return prisma.liveSource.findMany({
      where: { channelId, isActive: true },
      orderBy: { priority: "desc" }
    });
  }

  async deleteSource(id: string) {
    return prisma.liveSource.delete({ where: { id } });
  }

  async updateSource(id: string, data: Partial<any>) {
    return prisma.liveSource.update({
      where: { id },
      data
    });
  }
}

export const liveSourceRegistry = new LiveSourceRegistry();
