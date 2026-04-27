import { NextResponse } from "next/server"
import { getChannelsFromDB } from "@/lib/supabase-channels"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const channels = await getChannelsFromDB()
    
    return NextResponse.json(channels, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Channels API error:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    )
  }
}
