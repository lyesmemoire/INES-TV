import crypto from 'crypto'

/**
 * 🖋️ Sign Stream Token (SERVER ONLY)
 * Génère une signature HMAC-SHA256 pour sécuriser l'accès aux flux.
 * Ce module nécessite l'environnement Node.js.
 */
export function signStreamToken(matchId: string): string {
  const secret = process.env.STREAM_SECRET || 'fallback_secret_key_for_dev'
  
  return crypto
    .createHmac('sha256', secret)
    .update(matchId)
    .digest('hex')
}
