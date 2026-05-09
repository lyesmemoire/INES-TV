export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { signStreamToken } from '@/lib/server/security'

/**
 * 🔒 SECURE STREAM RESOLVER
 * Valide un jeton HMAC avant de retourner l'URL réelle du flux.
 * Empêche le hotlinking et le scraping direct des sources M3U8.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const matchId = searchParams.get('matchId')
  const token = searchParams.get('token')
  const sourceUrl = searchParams.get('source') // Base64 encoded or ID

  if (!matchId || !token) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  // Vérification de la signature HMAC via l'utilitaire serveur
  const expected = signStreamToken(matchId)

  if (token !== expected) {
    console.warn(`[Security] Invalid stream token attempt for match: ${matchId}`)
    return new NextResponse('Unauthorized: Invalid Signature', { status: 403 })
  }

  // Ici, on résoudrait l'URL réelle (ex: depuis la DB ou un proxy chiffré)
  // Pour la démo, on simule une URL protégée
  const realStreamUrl = `https://protected-stream.goala.tv/live/${matchId}/index.m3u8`

  return NextResponse.json({ 
    url: realStreamUrl,
    expires: Date.now() + 3600000 // 1 hour
  })
}
