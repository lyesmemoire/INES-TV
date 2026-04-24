/**
 * Enterprise Observability Core
 * Tracks runtime metrics for the process.
 */
export const metrics = {
  requests: 0,
  errors: 0,
  activeSseClients: 0,
  start: Date.now(),

  incrementRequests() { this.requests++; },
  incrementErrors() { this.errors++; },
  setSseClients(count: number) { this.activeSseClients = count; },
  
  getSummary() {
    return {
      uptime: Math.floor((Date.now() - this.start) / 1000),
      requests: this.requests,
      errors: this.errors,
      activeSseClients: this.activeSseClients,
      errorRate: this.requests > 0 ? (this.errors / this.requests).toFixed(4) : "0.0000"
    };
  }
};
