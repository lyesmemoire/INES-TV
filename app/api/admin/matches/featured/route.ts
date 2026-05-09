export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"

export async function GET() {
  const matches = await prisma.match.findMany({
    where: { isFeatured: true },
    orderBy: { featuredOrder: "asc" },
  })

  return Response.json(matches)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const featuredIds: string[] = body.featuredIds || []

  if (featuredIds.length > 3) {
    return new Response("Maximum 3 featured matches allowed", { status: 400 })
  }

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Reset all
    await tx.match.updateMany({
      data: { isFeatured: false, featuredOrder: null }
    })

    // Apply new order
    for (let i = 0; i < featuredIds.length; i++) {
      await tx.match.update({
        where: { id: featuredIds[i] },
        data: {
          isFeatured: true,
          featuredOrder: i + 1
        }
      })
    }
  })

  return Response.json({ success: true })
}
