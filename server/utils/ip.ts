import { Request } from 'express';

/**
 * 🛡️ IP NORMALIZATION UTILITY (Phase 22)
 * Correctly identifies the user's real IP address when behind a proxy (Cloudflare).
 * Priority: CF-Connecting-IP > X-Forwarded-For > req.ip
 */
export function getRealIp(req: Request): string {
  // 1. Cloudflare real user IP (Highest priority when proxied)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return Array.isArray(cfIp) ? cfIp[0] : cfIp;

  // 2. Standard proxy forwarding
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ips.trim();
  }

  // 3. Direct connection IP (Fallback)
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}
