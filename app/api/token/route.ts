export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const stream = url.searchParams.get("url")

    if (!stream) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    const secret = process.env.JWT_SECRET || "default_fallback_secret_for_dev_only"

    const token = jwt.sign(
      { stream },
      secret,
      { expiresIn: "30s" }
    )

    return NextResponse.json({ token })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
