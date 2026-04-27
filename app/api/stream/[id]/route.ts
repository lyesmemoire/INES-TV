import { channels } from "@/lib/channels"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const channel = channels.find(c => c.id === params.id)

  if (!channel) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    url: channel.url,
    type: "hls",
    token: "free-mode"
  })
}
