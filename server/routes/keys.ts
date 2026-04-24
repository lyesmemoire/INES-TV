import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { verifyStreamToken } from '../services/signedStreamUrl.service';
import { requireAuth, AuthRequest } from "../middleware/supabaseAuth.middleware";
import { prisma } from "../services/db";


const router = Router();

/**
 * 🔑 FAKE-DRM KEY SERVER (Phase 85 - Production Version)
 * Delivers AES-128 encryption keys via a custom JSON protocol.
 */

// Cache interne de 30s pour les clés par segment
const keyCache = new Map<string, { key: string; expires: number }>();
const KEY_TTL = 30 * 1000; // 30s

// Génère une clé AES-128 aléatoire (Hex Format)
function generateAES128Key(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Middleware pour vérifier le token HMAC
async function authMiddleware(req: Request, res: Response, next: Function) {
  const token = req.query.token as string;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  
  try {
    const payload = await verifyStreamToken(token);
    if (!payload) return res.status(403).json({ error: 'Token invalide ou expiré' });
    
    // Inject payload for downstream logic
    (req as any).streamPayload = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
}

// Route principale pour récupérer une clé AES pour un segment
router.get('/:segmentId', authMiddleware, (req: Request, res: Response) => {
  const segmentId = req.params.segmentId;
  const now = Date.now();

  // Vérifier cache
  const cached = keyCache.get(segmentId);
  if (cached && cached.expires > now) {
    return res.json({ key: cached.key });
  }

  // Générer et stocker
  const key = generateAES128Key();
  keyCache.set(segmentId, { key, expires: now + KEY_TTL });
  
  return res.json({ key });
});

export default router;
