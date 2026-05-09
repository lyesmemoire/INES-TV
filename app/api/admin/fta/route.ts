export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { FreeChannelService } from "@/src/services/FreeChannelService"

export async function GET() {
  const channels = await FreeChannelService.list()
  return Response.json(channels)
}

export async function POST(req: Request) {
  const body = await req.json()
  const channel = await FreeChannelService.create(body)
  return Response.json(channel)
}
