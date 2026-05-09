import { NextResponse } from "next/server"
import { runHealthCheck } from "@/lib/health"
import { autoCleanEngine } from "@/lib/autoClean"

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * ⏰ CRON ENDPOINT
 * Déclenche le scan de santé des flux + auto-clean engine.
 */
export async function GET() {
  try {
    // Quick health check (batch of 20)
    await runHealthCheck()

    // Full clean engine (parallel check + score + cleanup)
    const cleanResult = await autoCleanEngine()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      clean: cleanResult,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
