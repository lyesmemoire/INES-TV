import { NextResponse } from "next/server"
import { monitorChannels } from "@/lib/channelMonitor"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key") || request.headers.get("authorization")?.replace("Bearer ", "")

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Use waitUntil if available (Vercel) to not block the response
  try {
    const batchSize = parseInt(searchParams.get("batch") || "50")
    await monitorChannels(batchSize)
    return NextResponse.json({ 
      success: true, 
      batchSize,
      timestamp: new Date().toISOString() 
    })
  } catch (error: any) {
    console.error("[CRON ERROR] Channel monitoring failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
