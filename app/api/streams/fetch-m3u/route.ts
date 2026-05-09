export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`[API /streams/fetch-m3u] Fetching from: ${url}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch M3U: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    return NextResponse.json({ content: text });
  } catch (err: any) {
    console.error("[API /streams/fetch-m3u] Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch remote M3U" },
      { status: 500 }
    );
  }
}
