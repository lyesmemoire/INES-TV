import { EventEmitter } from "events";
import { sendAlert } from "./alert.service";
import { getEngineMetrics } from "./loadBalancer.service";


// Bus d'événements pour le Dashboard NOC
export const nocEvents = new EventEmitter();
nocEvents.setMaxListeners(50); // Set high for concurrent dashboard sessions

// ── État centralisé ───────────────────────────────────────

interface SourceState {
  healthy: boolean;
  load: number;
  lastHeartbeat: number;
  failCount: number;
}

const state = new Map<string, SourceState>();

function getOrInit(sourceId: string): SourceState {
  if (!state.has(sourceId)) {
    state.set(sourceId, {
      healthy: true,
      load: 0,
      lastHeartbeat: Date.now(),
      failCount: 0
    });
  }
  return state.get(sourceId)!;
}

// ── API publique ──────────────────────────────────────────

/**
 * Update source health (called by background health checks).
 */
export function updateSourceHealth(sourceId: string, healthy: boolean) {
  const entry = getOrInit(sourceId);

  const wasHealthy = entry.healthy;

  if (!healthy) {
    entry.failCount++;
  } else {
    entry.failCount = 0;
  }

  // Marque unhealthy après 3 échecs consécutifs
  entry.healthy = healthy || entry.failCount < 3;
  entry.lastHeartbeat = Date.now();

  // 🚨 ALERTING: Trigger on state change
  if (wasHealthy && !entry.healthy) {
    sendAlert("CDN Source Failed", `Source <b>${sourceId}</b> is now UNHEALTHY after ${entry.failCount} failed heartbeats.`, "CRITICAL");
  } else if (!wasHealthy && entry.healthy) {
    sendAlert("CDN Source Recovered", `Source <b>${sourceId}</b> is now back online.`, "LOW");
  }


  nocEvents.emit("health-update", {
    sourceId,
    healthy: entry.healthy,
    failCount: entry.failCount
  });
}

/**
 * Increment load for a source.
 */
export function incrementLoad(sourceId: string, userId: string) {
  const entry = getOrInit(sourceId);
  entry.load++;

  nocEvents.emit("load-update", {
    sourceId,
    load: entry.load,
    userId,
    event: "connect"
  });
}

/**
 * Decrement load for a source.
 */
export function decrementLoad(sourceId: string, userId: string) {
  const entry = getOrInit(sourceId);
  entry.load = Math.max(0, entry.load - 1);

  nocEvents.emit("load-update", {
    sourceId,
    load: entry.load,
    userId,
    event: "disconnect"
  });
}

/**
 * Get snapshot of all stats for the Dashboard.
 */
export function getAllStats(): Record<string, SourceState> {
  const result: Record<string, SourceState> = {};
  for (const [id, s] of state) {
    result[id] = { ...s };
  }
  return result;
}

export function getSourceState(sourceId: string): SourceState {
  return { ...getOrInit(sourceId) };
}

// ── Watchdog ──────────────────────────────────────────────
// Sources sans heartbeat depuis 90s → unhealthy automatique

const HEARTBEAT_TIMEOUT = 90_000;

export function startWatchdog() {
  const ALERT_LOAD_THRESHOLD = Number(process.env.ALERT_LOAD_THRESHOLD || 1000);

  setInterval(async () => {
    const now = Date.now();
    
    // 1. Check Heartbeats
    for (const [id, entry] of state) {
      if (now - entry.lastHeartbeat > HEARTBEAT_TIMEOUT) {
        if (entry.healthy) {
          entry.healthy = false;
          sendAlert("Source Heartbeat Timeout", `Source <b>${id}</b> timed out (90s without heartbeat). Marking as Offline.`, "HIGH");
          
          nocEvents.emit("health-update", {
            sourceId: id,
            healthy: false,
            reason: "heartbeat-timeout"
          });
        }
      }
    }

    // 2. Check Global Load
    try {
      const metrics = await getEngineMetrics();
      if (metrics.totalLoad >= ALERT_LOAD_THRESHOLD) {
        sendAlert("High System Load", `Cluster load is critical: <b>${metrics.totalLoad} req/s</b> (Threshold: ${ALERT_LOAD_THRESHOLD}).`, "HIGH");
      }
    } catch (err) {
      console.error("[NOC] Failed to check metrics in watchdog:", err);
    }

  }, 30_000).unref?.();
}

