import cache from "../lib/cache";

/**
 * Enterprise Distributed Circuit Breaker Pattern
 * Protects critical paths (DB, APIs) from cascading failures.
 * Syncs state across cluster using Redis.
 */
export class CircuitBreaker {
  private localFailures = 0;
  private localState: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private localNextAttempt = 0;
  
  private readonly name: string;
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(name: string, threshold = 5, resetTimeout = 30000) {
    this.name = `cb:${name}`;
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => T | Promise<T>): Promise<T> {
    const state = await this.getState();
    
    if (state === "OPEN") {
      const nextAttempt = await this.getNextAttempt();
      if (Date.now() > nextAttempt) {
        await this.setState("HALF_OPEN");
      } else {
        if (fallback) return await fallback();
        throw new Error("CIRCUIT_BREAKER_OPEN");
      }
    }

    try {
      const result = await fn();
      await this.onSuccess();
      return result;
    } catch (error) {
      await this.onFailure();
      if (fallback) return await fallback();
      throw error;
    }
  }

  private async onSuccess() {
    this.localFailures = 0;
    this.localState = "CLOSED";
    await cache.del(`${this.name}:failures`);
    await cache.set(`${this.name}:state`, "CLOSED", 3600);
  }

  private async onFailure() {
    const failures = await cache.incr(`${this.name}:failures`, 3600);
    this.localFailures = failures;

    if (failures >= this.threshold) {
      const nextAttempt = Date.now() + this.resetTimeout;
      await cache.set(`${this.name}:state`, "OPEN", Math.ceil(this.resetTimeout / 1000));
      await cache.set(`${this.name}:nextAttempt`, String(nextAttempt), Math.ceil(this.resetTimeout / 1000));
      
      this.localState = "OPEN";
      this.localNextAttempt = nextAttempt;
      
      console.error(`🚨 [CircuitBreaker] ${this.name} OPENED after ${failures} failures. Next attempt in ${this.resetTimeout}ms`);
    }
  }

  private async getState(): Promise<string> {
    const state = await cache.get(`${this.name}:state`);
    return state || this.localState;
  }

  private async setState(state: "CLOSED" | "OPEN" | "HALF_OPEN") {
    this.localState = state;
    await cache.set(`${this.name}:state`, state, 3600);
  }

  private async getNextAttempt(): Promise<number> {
    const next = await cache.get(`${this.name}:nextAttempt`);
    return next ? parseInt(next) : this.localNextAttempt;
  }
}

// Global instances for common resources
export const dbBreaker = new CircuitBreaker("db", 5, 30000);
export const externalApiBreaker = new CircuitBreaker("ext-api", 3, 10000);
