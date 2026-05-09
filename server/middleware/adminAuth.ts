import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
}

export interface AdminRequest extends Request {
  admin?: {
    adminId: string;
  };
}

/**
 * Middleware to protect routes that require active Admin authentication.
 * Verifies the JWT and sets req.admin with the decoded payload.
 */
export function adminAuth(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}
