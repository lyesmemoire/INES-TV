import { BlackoutService } from "../admin/system/blackout.service.js";

/**
 * 📁 /server/realtime/events.ts
 * Type-safe event broadcasters for the Sports Media OS.
 */

export function broadcastGoal(io: any, match: any) {
  io.emit("match:event", {
    type: "goal",
    match: {
      id: match.id,
      score: match.score,
      homeName: match.homeName,
      awayName: match.awayName
    },
    timestamp: Date.now()
  });
}

export async function broadcastFeedUpdate(io: any, feedItems: any[]) {
  if (await BlackoutService.shouldBlockSockets()) {
    console.log("[Socket] 🚨 PANIC EXTREME: Feed broadcast silenced.");
    return;
  }

  io.emit("feed:update", {
    items: feedItems,
    timestamp: Date.now()
  });
}

export async function broadcastMomentum(io: any, matchId: string, pressure: number) {
  if (await BlackoutService.shouldBlockSockets()) return;

  io.to(`match:${matchId}`).emit("match:momentum", {
    matchId,
    pressure,
    timestamp: Date.now()
  });
}

/**
 * ⚽ LIGHTWEIGHT SCORE SYNC (Soft Resync Mode)
 */
export async function broadcastScoreUpdate(io: any, matchId: string, score: string) {
  io.emit("match:score-sync", {
    matchId,
    score,
    timestamp: Date.now()
  });
}
