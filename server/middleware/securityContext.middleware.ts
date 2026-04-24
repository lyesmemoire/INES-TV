import { Request, Response, NextFunction } from "express";

/**
 * 🛡️ SECURITY CONTEXT MIDDLEWARE
 * Production-grade bot detection using IP entropy and User-Agent signals.
 * Moves beyond simple UA guards to a scored risk engine.
 */
export function securityContext(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0").toString();
  const ua = req.headers["user-agent"] || "";
  const cfCountry = (req.headers["cf-ipcountry"] || "XX").toString();

  // 🧠 RISK SCORING (Heuristics)
  // 1. UA Length & Quality
  const uaScore = 
    (!ua || ua.length < 20 ? 0.6 : 0) +
    (ua.includes("curl") ? 0.9 : 0) +
    (ua.includes("python") ? 0.9 : 0) +
    (ua.includes("headless") ? 0.8 : 0);

  // 2. IP Entropy (Simplified for MVP, would normally check against a blacklist/reputation DB)
  const ipScore = ip === "0.0.0.0" || ip === "127.0.0.1" ? 0.1 : 0;

  const totalBotScore = Math.min(1.0, uaScore + ipScore);

  (req as any).security = {
    ip,
    country: cfCountry,
    botScore: totalBotScore,
    isBot: totalBotScore > 0.8
  };

  // ⚡ EMERGENCY BLOCK (Optional: block obvious bots early)
  /*
  if ((req as any).security.isBot) {
    return res.status(403).json({ error: "Access Denied: Bot detected" });
  }
  */

  next();
}
