import { prisma } from "@/lib/prisma"
import slugify from "slugify"

export class FreeChannelService {

  static async create(data: any) {
    const slug = slugify(data.name, { lower: true })

    return prisma.freeChannel.create({
      data: {
        ...data,
        slug
      }
    })
  }

  static async list() {
    return prisma.freeChannel.findMany({
      include: { streams: true },
      orderBy: { name: "asc" }
    })
  }

  static async getBySlug(slug: string) {
    return prisma.freeChannel.findUnique({
      where: { slug },
      include: { streams: { where: { isActive: true } } }
    })
  }

  static async update(id: string, data: any) {
    return prisma.freeChannel.update({
      where: { id },
      data
    })
  }

  static async delete(id: string) {
    return prisma.freeChannel.delete({
      where: { id }
    })
  }
}
