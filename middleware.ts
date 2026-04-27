import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Redis } from "@upstash/redis"
import { createClient } from "@supabase/supabase-js"

const redis = Redis.fromEnv()

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
  "/api/metrics"
]

const PUBLIC_ROUTES = [
  "/api/health",
  "/api/channels" // Liste publique
]

// =====================
// LUA SCRIPT (ATOMIC RATE LIMIT)
// =====================
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, window)
  end
  
  return current
`

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

function matchRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route))
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

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Skip public routes
  if (matchRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  const ip = getClientIP(req)
  const limit = getRateLimitForPath(pathname)

  // =====================
  // RATE LIMITING (ATOMIC)
  // =====================
  try {
    const rateLimitKey = `rate:${ip}:${pathname.split("/")[2] || "general"}`
    
    const requests = await redis.eval(
      RATE_LIMIT_SCRIPT,
      [rateLimitKey],
      [limit, WINDOW]
    ) as number

    if (requests > limit) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          retryAfter: WINDOW 
        }),
        { 
          status: 429,
          headers: {
            "Retry-After": String(WINDOW),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0"
          }
        }
      )
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Fail open (allow request if Redis down)
  }

  // =====================
  // AUTHENTICATION
  // =====================
  const isProtected = matchRoute(pathname, PROTECTED_ROUTES)

  if (isProtected) {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      )
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data?.user) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401 }
        )
      }

      // =====================
      // SESSION LOCK
      // =====================
      const deviceId = req.headers.get("x-device-id")
      
      if (deviceId) {
        const userId = data.user.id
        const sessionKey = `session:${userId}`
        const activeDevice = await redis.get(sessionKey)

        if (activeDevice && activeDevice !== deviceId) {
          return new NextResponse(
            JSON.stringify({ 
              error: "Session active on another device",
              currentDevice: activeDevice 
            }),
            { status: 403 }
          )
        }

        // Update session
        await redis.set(sessionKey, deviceId, { ex: 3600 }) // 1 hour
      }

      // Inject user info for downstream routes
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set("x-user-id", data.user.id)
      requestHeaders.set("x-user-email", data.user.email || "")

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      // Security headers
      setSecurityHeaders(response)

      return response

    } catch (error) {
      console.error("Auth error:", error)
      return new NextResponse(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 500 }
      )
    }
  }

  // =====================
  // SECURITY HEADERS (NON-PROTECTED)
  // =====================
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
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      media-src ${trustedDomains};
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      font-src 'self' data:;
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
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
