import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rateLimit } from "@/lib/ratelimit"
import { isLegitCrawler } from "@/lib/security"

// =====================
// CONFIGURATION
// =====================
const RATE_LIMITS: Record<string, number> = {
  "/api/stream": 30,      // 30 req/min
  "/api/admin": 60,       // 60 req/min
  "/api/metrics": 120,    // 120 req/min
  "/api/auth": 10,        // 10 req/min
  "default": 100          // 100 req/min
}

const WINDOW = 60 // seconds

const PROTECTED_ROUTES = [
  "/api/stream",
  "/api/admin",
]



// =====================
// HELPERS
// =====================
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown"
  )
}


function getRateLimitForPath(pathname: string): number {
  const matched = Object.keys(RATE_LIMITS).find(route =>
    pathname.startsWith(route)
  )
  return matched ? RATE_LIMITS[matched] : RATE_LIMITS.default
}

// =====================
// MIDDLEWARE
// =====================
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua = req.headers.get("user-agent") || ""

  // 🥇 1️⃣ EXCLURE LES ROUTES CRITIQUES AVANT TOUT
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|webp)$/)
  ) {
    return NextResponse.next()
  }

  // 🥈 2️⃣ BOT DETECTION (SOFT)
  const isGooglebot = ua.toLowerCase().includes("googlebot")
  const isBingbot = ua.toLowerCase().includes("bingbot")
  const isOtherLegitBot = ua.toLowerCase().includes("applebot") || ua.toLowerCase().includes("duckduckbot") || ua.toLowerCase().includes("yandexbot")
  const isSocialBot = ua.includes("Twitterbot") || ua.includes("facebookexternalhit") || ua.includes("LinkedInBot")
  
  if (!isGooglebot && !isBingbot && !isOtherLegitBot && !isSocialBot) {
    if (
      ua.toLowerCase().includes("curl") ||
      ua.toLowerCase().includes("python") ||
      ua.toLowerCase().includes("wget") ||
      ua.toLowerCase().includes("headlesschrome") ||
      ua.toLowerCase().includes("puppeteer")
    ) {
      console.warn(`[Security] Bot blocked: ${ua}`)
      return new NextResponse("Forbidden: Access Denied", { status: 403 })
    }
  }

  // 🥉 3️⃣ RATE LIMIT (PAS SUR /login, /api/login, /api/health, /api/stream)
  const isLogin = pathname.includes("/login")
  const isHealth = pathname.includes("/health")
  const isStream = pathname.includes("/api/stream")
  const isBot = isLegitCrawler(ua)

  if (!isBot && !isLogin && !isHealth && !isStream && (pathname.startsWith("/api") || pathname.includes("/admin"))) {
    const ip = getClientIP(req)
    if (!rateLimit(ip)) {
      console.warn(`[Security] Rate limit exceeded for IP: ${ip}`)
      return new NextResponse("Too Many Requests", { 
        status: 429,
        headers: { "Retry-After": "10" }
      })
    }
  }

  // 🟢 4️⃣ MULTILINGUAL REDIRECTION
  const locales = ["fr", "en"]
  const defaultLocale = "fr"
  
  // Explicitly handle /admin and /tv-os before generic locale check
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/admin`, req.url))
  }
  if (pathname === "/tv-os") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/tv-os`, req.url))
  }

  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!hasLocale && !pathname.startsWith("/api")) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, req.url)
    )
  }

  // 🔵 5️⃣ ADMIN PROTECTION
  // Note: isAdmin matches /fr/admin, /en/admin, /fr/tv-os, etc.
  const isAdmin = pathname.includes("/admin") || pathname.includes("/tv-os")

  if (isAdmin && !isLogin) {
    // Read Supabase auth token from cookie
    const supabaseCookie = req.cookies.get("sb-access-token")?.value
      || req.cookies.getAll().find(c => c.name.includes("auth-token"))?.value

    if (!supabaseCookie) {
      return NextResponse.redirect(new URL(`/${pathname.split("/")[1] || defaultLocale}/login`, req.url))
    }

    try {
      // 1. Client for verifying the JWT token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: authData, error: authError } = await supabase.auth.getUser(supabaseCookie)

      if (authError || !authData?.user) {
        return NextResponse.redirect(new URL(`/${pathname.split("/")[1] || defaultLocale}/login`, req.url))
      }

      // 2. Admin Client to bypass RLS for role checking
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      )

      const { data: profile, error: profileError } = await adminSupabase
        .from("User")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error(`[Security] Error fetching profile for ${authData.user.id}:`, profileError)
      }

      if (!profile || profile.role !== "admin") {
        console.warn(`[Security] Unauthorized admin access attempt by ${authData.user.email} (Role: ${profile?.role})`)
        return NextResponse.redirect(new URL(`/${pathname.split("/")[1] || defaultLocale}`, req.url))
      }
    } catch (err) {
      console.error("[Security] Admin check error:", err)
      return NextResponse.redirect(new URL(`/${pathname.split("/")[1] || defaultLocale}/login`, req.url))
    }
  }

  // 🟣 6️⃣ SECURITY HEADERS
  const response = NextResponse.next()
  setSecurityHeaders(response)
  
  return response
}

// =====================
// SECURITY HEADERS
// =====================
function setSecurityHeaders(response: NextResponse) {
  const trustedDomains = [
    "'self'",
    process.env.NEXT_PUBLIC_APP_URL || "",
    // Add your stream CDN domains
  ].filter(Boolean).join(" ")

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  )
  response.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://secure-ad-network.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https:;
      media-src 'self' blob: https:;
      connect-src 'self' blob: https: wss://*.supabase.co https://secure-ad-network.com;
      font-src 'self' data: https://fonts.gstatic.com;
      frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://secure-ad-network.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, " ").trim()
  )

  // HSTS (HTTPS only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
  }
}

// =====================
// CONFIG
// =====================
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
