import { importFromM3ULink } from "@/src/server/iptv/importService"
import { saveChannels } from "@/src/server/iptv/saveChannels"
import { NextResponse } from "next/server"

export async function GET() {
  const PLAYLIST_URL = process.env.IPTV_SOURCE

  if (!PLAYLIST_URL) {
    return NextResponse.json({ error: "Missing IPTV_SOURCE env variable" }, { status: 500 })
  }

  try {
    const channels = await importFromM3ULink(PLAYLIST_URL)
    await saveChannels(channels)

    return NextResponse.json({
      success: true,
      count: channels.length,
    })
  } catch (err) {
    console.error("Cron refresh failed:", err)
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}
