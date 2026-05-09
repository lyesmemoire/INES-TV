import { syncMatchStatusFromAPI } from "@/src/lib/footballService"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // 1. Protection du cron endpoint
  const authHeader = req.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== cronSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await syncMatchStatusFromAPI()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("[CRON SYNC ERROR]", err)
    return NextResponse.json({ 
      error: "Sync failed", 
      message: err.message 
    }, { status: 500 })
  }
}
