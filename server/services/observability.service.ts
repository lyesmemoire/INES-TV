/**
 * OBSERVABILITY — ULTRA SIMPLE
 *
 * Phase 1: console.log only (zero cost, zero dependency).
 * Phase 2: swap logEvent() to write to Postgres when needed.
 *
 * Never blocks the stream path.
 */

export interface ObsEvent {
  userId: string;
  action: string;
  status: "ok" | "error" | "blocked";
  channelId?: string;
  meta?: Record<string, unknown>;
}

export function logEvent(event: ObsEvent): void {
  // Structured log — compatible with any log aggregator (Loki, Datadog, etc.)
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      ...event,
    })
  );
}
