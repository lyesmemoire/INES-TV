import { Server } from "socket.io";

/**
 * 📁 /server/realtime/socket.ts
 * Core Socket.io initialization — v1.5 TACTICAL FORESIGHT
 *
 * Namespaces:
 *   /        → User feedback and live scores
 *   /ops     → Industrial telemetry and NOC command
 *
 * /ops Rooms:
 *   ops:heatmap   → 1s heatmap:snapshot (100 nodes matrix)
 *   ops:status    → 1s metrics:snapshot (global KPIs)
 *   ops:forecast  → 5s forecast:snapshot (top-K momentum channels)  ← v1.5
 */
export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    transports: ["websocket"],
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // ── USER NAMESPACE (Default) ──────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`📡 User Peer connected: ${socket.id}`);

    socket.on("join", (room) => {
      socket.join(room);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User Peer disconnected: ${socket.id}`);
    });
  });

  // ── OPS NAMESPACE (Control Room) ──────────────────────────────────────────
  const ops = io.of("/ops");

  ops.on("connection", (socket) => {
    console.log(`🛡️  Ops Peer connected: ${socket.id}`);

    /**
     * Join specific NOC rooms.
     * Valid rooms: ops:heatmap | ops:status | ops:forecast
     */
    socket.on("ops:join", (room: string) => {
      const VALID_ROOMS = new Set([
        "ops:heatmap",
        "ops:status",
        "ops:forecast",
      ]);

      if (!VALID_ROOMS.has(room)) {
        console.warn(`[Socket/ops] Unknown room requested: ${room}`);
        return;
      }

      console.log(`🛡️  Ops Peer joining room: ${room} (${socket.id})`);
      socket.join(room);

      // Acknowledge join so the client can optimistically render the loading state
      socket.emit("ops:joined", { room, ts: Date.now() });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Ops Peer disconnected: ${socket.id}`);
    });
  });

  return io;
}
