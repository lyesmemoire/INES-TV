import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-change-it-in-prod';

// Extend Express Request to include resellerId directly
export interface ResellerRequest extends Request {
  resellerId?: string;
}

/**
 * Middleware to protect routes requiring an active Reseller session.
 * Sets req.resellerId directly (simpler access pattern).
 */
export function resellerAuth(req: ResellerRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { resellerId: string };
    req.resellerId = decoded.resellerId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired reseller token' });
  }
}
