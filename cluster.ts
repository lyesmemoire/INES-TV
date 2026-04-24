import cluster from "cluster";
import os from "os";
import { startServer } from "./server.js";
import { revenueOptimizer } from "./server/core/optimizer/RevenueOptimizer.js";
import { startWatchdog } from "./server/services/noc.service.js";
import { startHealthCheck } from "./server/services/loadBalancer.service.js";
import { CampaignCache } from "./server/core/memory/CampaignCache.js";
import sourcesData from "./server/data/sources.json" assert { type: "json" };

import { PlanStore } from "./server/core/memory/PlanStore.js";
import { AnalyticsStore } from "./server/core/memory/AnalyticsStore.js";

const CPU_COUNT = os.cpus().length;
const WORKERS = Math.max(1, CPU_COUNT - 1);

// ── SHARED MEMORY INITIALIZATION ─────────────────────────
// These must be created ONLY ONCE in the primary process
const sharedBuffers = {
  analytics: new SharedArrayBuffer(10 * 8),
  analyticsComputed: new SharedArrayBuffer(10 * 8), 
  plan: new SharedArrayBuffer(1000 * 4 * 8),
  campaigns: {
    bids: new SharedArrayBuffer(2000 * 8),
    qualities: new SharedArrayBuffer(2000 * 8),
    geo: new SharedArrayBuffer(2000 * 1),
    active: new SharedArrayBuffer(2000 * 1),
    meta: new SharedArrayBuffer(8)
  }
};

if (cluster.isPrimary) {
  console.log("==========================================");
  console.log(`🚀 STREAMPERF AdX - ULTRA KERNEL v3`);
  console.log(`🚀 Master ${process.pid} - Forking ${WORKERS} Workers`);
  console.log("==========================================");

  // 1. Fork workers with buffer injection
  for (let i = 0; i < WORKERS; i++) {
    const worker = cluster.fork({ CLUSTER_MODE: "true" });
    
    // ⚡ PROD-READY IPC HANDSHAKE
    // We send the buffers immediately after fork
    worker.on('online', () => {
      worker.send({ type: 'INIT_BUFFERS', buffers: sharedBuffers });
    });
  }

  // 2. Auto-heal
  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} died. Respawning...`);
    cluster.fork({ CLUSTER_MODE: "true" });
  });

  // 3. MASTER-ONLY BACKGROUND SERVICES
  console.log("⚙️ [Master] Starting background optimizers...");
  
  // Revenue Optimizer (KPIs & Bids every 2s)
  setInterval(() => revenueOptimizer.tick(), 2000);

  // Plan Store: Background Tenant Validation (Supabase)
  PlanStore.startAutoRefresh();

  // NOC Watchdog
  startWatchdog();

  // Health Check Engine
  const allSources = Object.values(sourcesData).flatMap((c: any) => c.sources || []);
  startHealthCheck(allSources);

  // 🚀 [MESH] LEVEL 7 DISTRIBUTED SIMULATOR
  const { MeshSimulator } = await import("./server/core/mesh/MeshSimulator.js");
  MeshSimulator.initialize(100);

  // 🌍 [EDGE] GLOBAL MESH SNAPSHOT ENGINE (Level 6)
  // Master process rebuilds regional state snapshots every 30s
  setInterval(async () => {
    try {
      const { EventLogService } = await import("./server/services/eventLog.service.js");
      const { REGIONS } = await import("./server/core/edge-router.js");
      
      for (const region of REGIONS) {
        const events = await EventLogService.replayRegionSegment(region);
        const securityState: Record<string, any> = {};
        
        for (const e of events) {
          if (e.type === 'AUTH_FAILURE' || e.type === 'REQUEST') {
            const ip = e.data.ip;
            if (!securityState[ip]) securityState[ip] = { rateLimitCount: 0, authFailures: 0 };
            
            if (e.type === 'AUTH_FAILURE') securityState[ip].authFailures++;
            if (e.type === 'REQUEST') securityState[ip].rateLimitCount++;
          }
        }
        
        await EventLogService.saveRegionSnapshot(region, { security: securityState });
      }
      console.log("💾 [EDGE_MESH] Regional snapshots persisted (Global Consistency Sync).");
    } catch (err) {
      console.error("🚨 [EDGE_MESH] Mesh snapshot task FAILED:", err);
    }
  }, 30000).unref();

  // Seeding (in EVERY process for Cluster memory safety)
  if (process.env.LOAD_TEST === "true") {
    console.log(`💎 [${cluster.isPrimary ? "Master" : "Worker"}] Seeding high-perf campaign segment...`);
    const geos = ["US", "EU", "MA", "TN", "DZ", "OTHER"];
    for (let i = 0; i < 500; i++) {
        CampaignCache.set({
            id: `cmp_${i}`,
            name: `Stress Test campaign ${i}`,
            cpm: 0.5 + Math.random() * 5,
            budget: 10000000,
            spent: 0,
            geo: geos[i % geos.length],
            segment: "STANDARD",
            isActive: true
        });
    }
  }

} else {
  // ── WORKER INITIALIZATION ────────────────────────────────  // 3. Worker Logic
  process.on('message', (msg: any) => {
    if (msg.type === 'INIT_BUFFERS') {
      const { buffers } = msg;

      // 🛡️ v4 Hardening: Enforce shared memory initialization
      if (!buffers || !buffers.analytics) {
        console.error("❌ Worker: Shared memory initialization FAILED.");
        process.exit(1);
      }

      // 💉 Inject Buffers into Stores
      AnalyticsStore.setBuffer(buffers.analytics, buffers.analyticsComputed);
      PlanStore.setBuffer(buffers.plan);
      CampaignCache.setBuffers(buffers.campaigns);

      // NOTE: tenant bitset is bootstrapped from the IPC buffer at start.
      // DB refresh runs in Primary only to avoid N-worker DB flood.
      console.log(`💎 [Worker ${process.pid}] Shared memory initialized. Starting server...`);
      
      startServer().catch(err => {
        console.error(`[Worker ${process.pid}] Failed:`, err);
        process.exit(1);
      });
    }
  });
}
