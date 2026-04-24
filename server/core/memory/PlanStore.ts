import { prisma } from "../../lib/prisma.js";

/**
 * ⚡ PLAN STORE (Cluster-Safe)
 * Tracks user-specific quotas and limits using Shared memory.
 */

const MAX_PUBLISHERS = 1000;
const SLOTS_PER_PUB = 4; // [0]: Imps, [1]: Plan, [2]: Load Blocks, [3]: Quota Blocks

export class PlanStore {
  private static buf = new SharedArrayBuffer(MAX_PUBLISHERS * SLOTS_PER_PUB * 8);
  private static data = new BigUint64Array(this.buf);
  private static activeTenants = new Set<string>();

  static setBuffer(buf: SharedArrayBuffer) {
    this.buf = buf;
    this.data = new BigUint64Array(buf);
  }

  /**
   * ⚡ DETERMINISTIC HASH (FNV-1a)
   * Maps PID to a stable index across all cluster workers.
   */
  static getIdx(pid: string): number {
    let hash = 2166136261;
    for (let i = 0; i < pid.length; i++) {
        hash ^= pid.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash) % MAX_PUBLISHERS;
  }

  static setActiveTenants(pids: string[]) {
    this.activeTenants = new Set(pids);
  }

  static isValidTenant(pid: string): boolean {
    // If unknown PID, the system defaults to FREE tier logic rather than immediate rejection
    return this.activeTenants.has(pid);
  }

  static async startAutoRefresh() {
    const refresh = async () => {
      try {
        const users = await prisma.user.findMany({
          where: { isBanned: false },
          select: { id: true, plan: true }
        });

        const ids = users.map(u => u.id);
        this.setActiveTenants(ids);

        // Also sync plans into Shared memory
        for (const user of users) {
          const planCode = user.plan === "PRO" ? 1 : (user.plan === "SCALE" ? 2 : 0);
          this.setPlan(user.id, planCode);
        }

        console.log(`📡 [PlanStore] Synced ${ids.length} active tenants.`);
      } catch (err) {
        console.error("✕ [PlanStore] Failed to refresh tenants:", err);
      }
    };

    await refresh();
    setInterval(refresh, 60000);
  }

  static recordImpression(pid: string) {
    const idx = this.getIdx(pid);
    Atomics.add(this.data, idx * SLOTS_PER_PUB, 1n);
  }

  static getQuota(pid: string) {
    const idx = this.getIdx(pid);
    const imps = Number(Atomics.load(this.data, idx * SLOTS_PER_PUB));
    const plan = Number(Atomics.load(this.data, idx * SLOTS_PER_PUB + 1));
    
    return { imps, plan };
  }

  static getAnalytics(pid: string) {
    const idx = this.getIdx(pid);
    const imps = Number(Atomics.load(this.data, idx * SLOTS_PER_PUB));
    const loadBlocks = Number(Atomics.load(this.data, idx * SLOTS_PER_PUB + 2));
    const quotaBlocks = Number(Atomics.load(this.data, idx * SLOTS_PER_PUB + 3));
    
    return { imps, loadBlocks, quotaBlocks };
  }

  static recordBlock(pid: string, type: 'LOAD' | 'QUOTA') {
    const idx = this.getIdx(pid);
    const slot = type === 'LOAD' ? 2 : 3;
    Atomics.add(this.data, idx * SLOTS_PER_PUB + slot, 1n);
  }

  static setPlan(pid: string, plan: number) {
    const idx = this.getIdx(pid);
    Atomics.store(this.data, idx * SLOTS_PER_PUB + 1, BigInt(plan));
  }

  static checkLimit(pid: string) {
    const { imps, plan } = this.getQuota(pid);

    if (plan === 0) { // FREE
      if (imps >= 10000) {
        this.recordBlock(pid, 'QUOTA');
        return { allowed: false, type: 'HARD', msg: "Free limit reached. Contact sales." };
      }
      if (imps >= 8000) return { allowed: true, type: 'SOFT', msg: "Approaching limit (80%). Upgrade to avoid revenue loss." };
    }

    return { allowed: true, type: 'NONE' };
  }
}
