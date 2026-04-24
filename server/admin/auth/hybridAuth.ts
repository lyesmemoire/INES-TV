import { Request, Response, NextFunction } from "express";
import { requireAdmin } from "../../middleware/supabaseAuth.middleware.js";

/**
 * 🔐 HYBRID ADMIN AUTH (Industrial Grade)
 * 1. ADMIN_SECRET -> Emergency / Server-to-Server OOB Access
 * 2. Supabase Admin -> Standard UI Dashboard Access
 */
export async function hybridAuth(req: Request, res: Response, next: NextFunction) {
  const adminSecret = req.headers["x-admin-secret"];

  // 1. Break-glass secret access
  if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
     console.log(`[Auth] 🚨 EMERGENCY ACCESS GRANTED (OOB Header)`);
     return next();
  }

  // 2. Standard Session access
  // requireAdmin will check the JWT role via Supabase
  return requireAdmin(req as any, res, next);
}
