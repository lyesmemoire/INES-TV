export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import jwt from "jsonwebtoken"

// 🛡️ SSRF PROTECTION: Block private/internal IP ranges
const BLOCKED_HOSTNAMES = [
  'localhost', '127.0.0.1', '[::1]', '0.0.0.0',
  'metadata.google.internal', 'metadata.google.com',
  '169.254.169.254', // AWS/GCP metadata
  'metadata.internal',
];

function isPrivateIP(hostname: string): boolean {
  // Block known dangerous hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) return true;
  
  // Block RFC1918, link-local, loopback ranges
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p))) {
    if (parts[0] === 10) return true;                                    // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true;              // 192.168.0.0/16
    if (parts[0] === 127) return true;                                   // 127.0.0.0/8
    if (parts[0] === 169 && parts[1] === 254) return true;              // 169.254.0.0/16
    if (parts[0] === 0) return true;                                     // 0.0.0.0/8
  }
  return false;
}

// 🛡️ Allowed stream domains (add your CDN/stream domains here)
const ALLOWED_DOMAIN_PATTERNS = [
  /\.cdn\.yourapp\.com$/,
  /\.supabase\.co$/,
  /\.workers\.dev$/,
  /\.akamaized\.net$/,
  /\.cloudfront\.net$/,
  /\.m3u8$/,      // Direct HLS file links
];

export async function GET(req: Request) {
  const urlParam = new URL(req.url).searchParams.get("url")

  if (!urlParam) return new Response("Missing URL", { status: 400 })

  // 🛡️ JWT Anti-Leech Protection — NO FALLBACK SECRET
  const token = req.headers.get("x-token")
  const secret = process.env.JWT_SECRET

  if (!secret) {
    console.error("[PROXY] FATAL: JWT_SECRET not configured");
    return new Response("Internal Server Error", { status: 500 })
  }

  if (!token) {
    return new Response("Unauthorized - Missing Token", { status: 401 })
  }

  try {
    jwt.verify(token, secret)
  } catch {
    return new Response("Unauthorized - Invalid or Expired Token", { status: 401 })
  }

  // 🛡️ SSRF Protection: Validate URL before fetching
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    return new Response("Invalid URL", { status: 400 })
  }

  // Enforce HTTPS only
  if (parsedUrl.protocol !== "https:") {
    return new Response("Forbidden - HTTPS only", { status: 403 })
  }

  // Block private/internal IPs
  if (isPrivateIP(parsedUrl.hostname)) {
    console.warn(`[PROXY] SSRF attempt blocked: ${parsedUrl.hostname}`);
    return new Response("Forbidden", { status: 403 })
  }

  // 🌍 Multi-CDN Routing
  let targetUrl = urlParam
  const region = req.headers.get("x-vercel-ip-country")
  
  if (region === "BR") {
    // Example: route to a dedicated Brazil proxy or switch URL prefix
    // targetUrl = targetUrl.replace("main-cdn", "br-cdn")
  }

  const upstream = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    signal: AbortSignal.timeout(10000), // 10s timeout to prevent slowloris
  })

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/vnd.apple.mpegurl",
      "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
      // Restrict CORS to own origin instead of wildcard
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "https://goalatv.com"
    }
  })
}
