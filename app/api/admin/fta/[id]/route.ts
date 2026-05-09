export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  return Response.json(await prisma.freeChannel.update({
    where: { id: params.id },
    data: body
  }))
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Deleting FreeChannel:", params.id)

    const deleted = await prisma.freeChannel.delete({
      where: { id: params.id }
    })

    return Response.json({ success: true, deleted })

  } catch (error: any) {
    console.error("FTA DELETE ERROR:", error)

    return new Response(
      JSON.stringify({
        error: error.message || "Deletion failed"
      }),
      { status: 500 }
    )
  }
}
