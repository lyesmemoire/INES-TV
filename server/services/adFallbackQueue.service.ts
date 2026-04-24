/**
 * ⚡ ASYNC AD FALLBACK QUEUE
 * Background worker for processing Tier-4 external demand (Adsterra/PropellerAds)
 * without blocking the main RTB auction hot path.
 */
class AdFallbackQueue {
  private queue: any[] = [];
  private isProcessing = false;

  constructor() {
    this.startWorker();
  }

  enqueue(slotId: string, context: any) {
    this.queue.push({
      slotId,
      context,
      timestamp: Date.now()
    });
    
    // 🔥 Optional: Metric for observability
    // console.log(`💰 [Queue] Enqueued fallback for slot ${slotId}. Size: ${this.queue.length}`);
  }

  private startWorker() {
    setInterval(() => {
      this.processNext();
    }, 200); // 200ms tick for best-effort processing
  }

  private async processNext() {
    if (this.queue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const job = this.queue.shift();

    try {
      // 🚀 ASYNC EXTERNAL DEMAND FETCH (Simulated)
      // In production, this would be a real server-to-server RTB call
      await this.simulateExternalFetch(job.slotId);
    } catch (err) {
      // console.warn(`💎 [Queue] Fallback failed for ${job.slotId}`, err);
    } finally {
      this.isProcessing = false;
    }
  }

  private simulateExternalFetch(slotId: string): Promise<void> {
    return new Promise((resolve) => {
      // Random latency 50-150ms
      const latency = 50 + Math.random() * 100;
      setTimeout(() => {
        // console.log(`💰 [Queue] External Demand filled for ${slotId} in ${latency.toFixed(0)}ms`);
        resolve();
      }, latency);
    });
  }
}

export const adFallbackQueue = new AdFallbackQueue();
