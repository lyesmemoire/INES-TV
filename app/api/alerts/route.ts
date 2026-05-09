export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/analytics";

export async function GET() {
  try {
    const alerts = await getAlerts(20);
    return NextResponse.json(alerts);
  } catch (error) {
    // Return empty array if Redis is not available
    console.error("[API /alerts] Error:", error);
    return NextResponse.json([]);
  }
}
