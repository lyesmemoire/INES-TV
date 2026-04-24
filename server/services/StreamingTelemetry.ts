import { redisClient, usingRedis } from "../lib/cache.js";

interface TelemetryEvent {
  stream: string;
  data: Record<string, any>;
  timestamp: number;
}

/**
 * 📊 STREAMING TELEMETRY (Industrial SRE v2.1)
 * High-performance, non-blocking telemetry buffer with adaptive flush.
 */
export class StreamingTelemetry {
  private buffer: TelemetryEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 500;
  private readonly FLUSH_INTERVAL_MS = 1000;
  private flushTimer: NodeJS.Timeout | null = null;

  private isFlushing = false;

  constructor() {
    this.startInterval();
  }

  /**
   * Push an event to the telemetry buffer.
   * Uses queueMicrotask to stay off the hot path.
   */
  push(stream: string, data: Record<string, any>) {
    queueMicrotask(() => {
      this.buffer.push({
        stream,
        data,
        timestamp: Date.now()
      });

      // Adaptive Flush: Burst Protection
      if (this.buffer.length >= this.MAX_BUFFER_SIZE && !this.isFlushing) {
        this.flush();
      }
    });
  }

  /**
   * Flush all buffered events to Redis Streams.
   */
  async flush() {
    if (this.buffer.length === 0 || this.isFlushing || !usingRedis || !redisClient) {
      if (this.buffer.length > 0 && !usingRedis) this.buffer = []; 
      return;
    }

    this.isFlushing = true;
    try {
      const eventsToFlush = [...this.buffer];
      this.buffer = [];

    // Grouping by stream for potential mass-insertion (Redis pipeline)
    const pipeline = redisClient.pipeline();

    for (const event of eventsToFlush) {
      const streamKey = `ops:telemetry:${event.stream}`;
      const args: string[] = [];
      
      for (const [k, v] of Object.entries(event.data)) {
        args.push(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      }
      args.push("ts", event.timestamp.toString());

      pipeline.xadd(streamKey, "MAXLEN", "~", "10000", "*", ...args);
    }

    } finally {
      this.isFlushing = false;
    }
  }

  private startInterval() {
    this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
    if (this.flushTimer.unref) this.flushTimer.unref();
  }
}

export const streamingTelemetry = new StreamingTelemetry();
