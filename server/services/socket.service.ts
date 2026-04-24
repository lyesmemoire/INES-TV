import { Server } from "socket.io";
import { FeedOrchestrator } from "../core/FeedOrchestrator.js";

/**
 * 🟢 SOCKET SERVICE (Industrial Real-Time Layer)
 * Rules:
 * 1. Instant Push: Goals, Cards, Penalties
 * 2. Throttled Push: Feed Re-ranks (min 20s)
 * 3. Snapshot Sync: Emit layout plan instead of raw data
 */
export class SocketService {
  private static io: Server | null = null;
  private static lastRerankTime = 0;
  private static RERANK_THROTTLE_MS = 20000;

  static init(io: Server) {
    this.io = io;
    console.log("🟢 SocketService initialized");

    io.on("connection", (socket) => {
      console.log(`📡 New peer: ${socket.id}`);
      
      socket.on("join_match", (matchId) => {
        socket.join(`match:${matchId}`);
      });
    });
  }

  /**
   * ⚡ INSTANT EVENT BROADCAST
   * For goals, cards, etc.
   */
  static async pushEvent(matchId: string, eventType: string, details: any) {
    if (!this.io) return;
    
    // 1. Broadcast to match room
    this.io.to(`match:${matchId}`).emit("match_event", {
       type: eventType,
       matchId,
       details,
       timestamp: Date.now()
    });

    // 2. Trigger potential re-rank if event is high-impact (Goal)
    if (["goal", "red_card"].includes(eventType)) {
       await this.triggerRerank();
    }
  }

  /**
   * 🔄 THROTTLED FEED RE-RANK
   * Recalculates layout and broadcasts to all users.
   */
  static async triggerRerank() {
    if (!this.io) return;
    
    const now = Date.now();
    if (now - this.lastRerankTime < this.RERANK_THROTTLE_MS) {
       console.log("[Socket] ⏳ Re-rank throttled");
       return;
    }

    this.lastRerankTime = now;
    console.log("[Socket] 🏆 Broadcasting Full Re-rank snapshot...");
    
    const layout = await FeedOrchestrator.getHomeLayout();
    this.io.emit("feed_update", { layout, timestamp: now });
  }

  /**
   * 📈 MONITORING (Simulated Momentum Updates)
   * Broadcasts momentum updates to observers.
   */
  static pushMomentum(matchId: string, stats: any) {
    if (!this.io) return;
    this.io.to(`match:${matchId}`).emit("momentum_update", stats);
  }
}
