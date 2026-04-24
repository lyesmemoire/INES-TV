import express, { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Simple health-check endpoint for load balancers, monitoring tools, and CI/CD.
 */
let cachedMemory = process.memoryUsage();
let lastMemoryCheck = 0;
const MEMORY_CACHE_MS = 2000;

router.get('/health', (_req: Request, res: Response) => {
  const now = Date.now();
  
  if (now - lastMemoryCheck > MEMORY_CACHE_MS) {
    cachedMemory = process.memoryUsage();
    lastMemoryCheck = now;
  }

  res.json({
    status: 'ok',
    workerId: process.env.WORKER_ID || 'master',
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsed: Math.floor(cachedMemory.heapUsed / 1024 / 1024) + ' MB',
      rss: Math.floor(cachedMemory.rss / 1024 / 1024) + ' MB',
    },
    timestamp: new Date().toISOString()
  });
});

// 💣 Phase 7: HEALTHCHECK PUBLIC SAFE (UptimeRobot, etc.)
// Minimal footprint, no internal metrics exposed
router.get('/public/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
