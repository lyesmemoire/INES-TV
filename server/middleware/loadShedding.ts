import { Request, Response, NextFunction } from "express";
import os from "os";

/**
 * Enterprise Load Shedding Middleware
 * Automatically sheds traffic if system resources (CPU/RAM) are exhausted.
 */
export function loadShedding(req: Request, res: Response, next: NextFunction) {
  // 1. Check Memory (Threshold: Process Heap > 1.5GB)
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

  // On standard Node instances, > 1.5GB heap is a danger zone (default limit is ~1.4GB - 2GB)
  if (heapUsedMB > 1500) {
    console.error(`🚨 [SRE] LOAD_SHEDDING: High Process Memory Usage (${heapUsedMB.toFixed(2)} MB)`);
    return res.status(503).json({
      error: "SERVICE_UNAVAILABLE",
      message: "Server is under extreme memory pressure. Please try again later."
    });
  }

  // 2. Check CPU Load (Threshold: loadavg > CPU core count * 0.85)
  const cpus = os.cpus().length;
  const loadAvg = os.loadavg()[0]; // 1 min average
  
  if (loadAvg > cpus * 0.85) {
    console.error(`🚨 [SRE] LOAD_SHEDDING: High CPU Load (${loadAvg.toFixed(2)} / ${cpus})`);
    return res.status(503).json({
      error: "SERVICE_UNAVAILABLE",
      message: "Server is under extreme CPU pressure. Please try again later."
    });
  }

  next();
}
