/**
 * 🧠 AD CONTEXT MIDDLEWARE (Industrial Version)
 */
export interface BidContext {
  userId?: string;
  tenantId: string;
  geo?: any;
  segment?: any;
  device?: any;
  qoeScore?: number;
  trustScore?: number;
  totalMultiplier?: number;
}

import { Request, Response, NextFunction } from 'express';
import { MatchStateEngine } from '../core/MatchStateEngine.js';
import { prisma } from '../lib/prisma.js';

export async function adContext(req: Request, res: Response, next: NextFunction) {
  const ctx = await computeMultipliers(req);
  (req as any).adContext = ctx;
  next();
}

export async function computeMultipliers(req: any, forceSlotIndex?: number) {
  const slotIndex = forceSlotIndex !== undefined ? forceSlotIndex : Number(req.query.slotIndex || 0);
  let positionMultiplier = 1.0;

  if (slotIndex === 0) positionMultiplier = 1.4; // Hero
  else if (slotIndex < 3) positionMultiplier = 1.0; // Standard
  else positionMultiplier = 0.7; // Remnant

  const country = (req.headers["cf-ipcountry"] || "MA").toString();
  const isUS = country === "US";
  const geoMultiplier = isUS ? 1.8 : 1.0;
  
  const deviceMultiplier = /Mobile|Android|iPhone/.test(req.headers["user-agent"] || "")
    ? 1.1
    : 1.0;

  // 🏟️ ADVANCED ENGAGEMENT ENGINE (2.0 - Momentum & Time Decay)
  let engagementMultiplier = 1.0;
  const matchId = req.query.matchId || req.body.matchId;
  
  if (matchId) {
    const match = await prisma.channel.findUnique({ where: { id: String(matchId) } });
    if (match) {
       const timeBoost = MatchStateEngine.getTimeBoost(match);
       const tierWeight = MatchStateEngine.getTierWeight(match.league);
       engagementMultiplier = timeBoost * tierWeight;
    }
  }

  return {
    positionMultiplier,
    geoMultiplier,
    deviceMultiplier,
    engagementMultiplier,
    totalMultiplier: positionMultiplier * geoMultiplier * deviceMultiplier * engagementMultiplier,
    tenantId: req.params.pid || req.query.pid || "demo_pub"
  };
}
