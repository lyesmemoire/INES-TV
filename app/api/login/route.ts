export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  try {
    if (!rateLimit(ip)) {
      throw new Error('Rate limit exceeded')
    }
    
    // If we reach here, rate limit is OK
    return NextResponse.json({ success: true })
  } catch (rejRes) {
    // Rate limit exceeded
    console.warn(`[Security] Brute-force detected from IP: ${ip}`)
    
    // Log the failed attempt to admin_logs (optional but recommended)
    // await logAdminAction('FAILED_LOGIN_ATTEMPT', 'AUTH', { ip })
    
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }
}
