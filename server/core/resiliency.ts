/**
 * Enterprise Circuit Breaker Pattern
 * Protects critical paths (DB, APIs) from cascading failures.
 */
export class CircuitBreaker {
  private failures = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private nextAttempt = 0;
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(threshold = 5, resetTimeout = 30000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => T | Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.state = "HALF_OPEN";
      } else {
        if (fallback) return await fallback();
        throw new Error("CIRCUIT_BREAKER_OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return await fallback();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`🚨 [CircuitBreaker] OPENED after ${this.failures} failures. Next attempt in ${this.resetTimeout}ms`);
    }
  }

  getState() {
    return this.state;
  }
}

// Global instances for common resources
export const dbBreaker = new CircuitBreaker(5, 30000);
export const externalApiBreaker = new CircuitBreaker(3, 10000);
