import { Request, Response, NextFunction } from "express";
import { redisClient, usingRedis } from "../lib/cache.js";

/**
 * 🔐 SESSION LOCK MIDDLEWARE (Anti-Account Sharing)
 * Uses Redis Lua script for atomic session enforcement.
 * One user = one active session. New device kicks the old one instantly.
 */

const SESSION_LUA = `
local key = KEYS[1]
local sessionId = ARGV[1]
local existing = redis.call("GET", key)
if not existing then
  redis.call("SET", key, sessionId, "EX", 3600)
  return "OK"
end
if existing == sessionId then
  redis.call("EXPIRE", key, 3600)
  return "OK"
else
  redis.call("SET", key, sessionId, "EX", 3600)
  return "KICK"
end
`;

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, string>();

async function enforceSession(userId: string, sessionId: string): Promise<string> {
  if (usingRedis && redisClient) {
    try {
      const result = await (redisClient as any).eval(SESSION_LUA, 1, `session:active:${userId}`, sessionId);
      return result as string;
    } catch (err) {
      console.warn("[SessionLock] Redis eval failed, using memory fallback");
    }
  }

  // Memory fallback
  const existing = memoryStore.get(userId);
  if (!existing) {
    memoryStore.set(userId, sessionId);
    return "OK";
  }
  if (existing === sessionId) return "OK";
  memoryStore.set(userId, sessionId);
  return "KICK";
}

export async function sessionLock(req: any, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return next(); // Let auth middleware handle unauthorized

  const sessionId = req.headers["x-session-id"] as string;
  if (!sessionId) return next(); // No session header = skip lock

  try {
    const result = await enforceSession(user.id, sessionId);
    if (result === "KICK") {
      console.warn(`[SessionLock] 🚫 User ${user.id} kicked — new device connected`);
      return res.status(403).json({
        error: "SESSION_KICKED",
        message: "Another device connected to your account",
      });
    }
  } catch (err) {
    console.error("[SessionLock] Error:", err);
  }

  next();
}
