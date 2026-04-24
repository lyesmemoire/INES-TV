import { createClient } from "@supabase/supabase-js";
import { Request, Response, NextFunction } from "express";

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthUser {
  id: string;
  email?: string;
  plan?: string;
  role?: string;
  tenantId?: string; // 🔒 Tenant Isolation
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Validates Supabase JWT from Authorization header.
 * Attaches user to req.user.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // 🔑 OPS BYPASS
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  const opsKey = process.env.OPS_API_KEY;
  if (opsKey && apiKey && apiKey === opsKey) {
    req.user = {
      id: "00000000-0000-0000-0000-000000000000", // Standard Nil/System UUID
      role: "ADMIN",
      tenantId: "00000000-0000-0000-0000-000000000000"
    };
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const token = header.slice(7);

  // Verification via Admin SDK (fast, hits Auth cache)
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }

  // Extract from user metadata sync'd between Supabase Auth and Prisma
  const user = data.user;
  req.user = {
    id: user.id, // ✅ STANDARD UNIQUE
    email: user.email ?? "",
    role: user.user_metadata?.role ?? "USER",
    plan: user.user_metadata?.plan ?? "FREE",
    tenantId: user.user_metadata?.tenantId,
  };

  next();
}

/**
 * Optional Auth - attaches user if valid token exists, proceeds otherwise.
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice(7);

  try {
    const { data } = await supabase.auth.getUser(token);
    if (data.user) {
      const user = data.user;
      req.user = {
        id: user.id, // ✅ STANDARD UNIQUE
        email: user.email ?? "",
        role: user.user_metadata?.role ?? "USER",
        plan: user.user_metadata?.plan ?? "FREE",
        tenantId: user.user_metadata?.tenantId,
      };
    }
  } catch {
    // Fail silently, remain anonymous
  }

  next();
}

/**
 * Admin guard - must follow requireAuth
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPER_ADMIN" && req.user?.id !== "system-ops") {
    return res.status(403).json({ error: "ADMIN_ACCESS_REQUIRED" });
  }
  next();
}

/**
 * Tenant Isolation guard - must follow requireAuth and tenantMiddleware
 */
export function requireTenant(
  req: any, // Express req object potentially decorated with req.tenantId
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "UNAUTHORIZED: Call requireAuth first" });
  }

  const resourceTenantId = req.tenantId || req.headers["x-tenant-id"] || "default";

  // Bypass for root admins
  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  // Strict structural barrier
  if (req.user.tenantId && req.user.tenantId !== resourceTenantId) {
    return res.status(403).json({ 
      error: "TENANT_MISMATCH_FORBIDDEN",
      message: "This resource is entirely outside your organizational boundary."
    });
  }

  next();
}
