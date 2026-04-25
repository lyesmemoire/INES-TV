import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url, type } = await request.json();

    // Test basique de connectivité
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const valid = response.ok;

      return NextResponse.json({
        valid,
        status: response.status,
        contentType: response.headers.get("content-type"),
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      return NextResponse.json({
        valid: false,
        error: "Connection failed",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
