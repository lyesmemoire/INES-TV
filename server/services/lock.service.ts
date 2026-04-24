import { prisma } from "../lib/prisma"
import os from "os"

const OWNER_ID = `${os.hostname()}-${process.pid}`

export class LockService {
  /**
   * Tries to acquire a distributed lock for a specific job.
   * Uses an atomic upsert with a check on the expiresAt field.
   */
  static async tryAcquireLock(key: string, ttlMs: number): Promise<boolean> {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttlMs)

    try {
      // 1. Transaction to check current lock state
      return await prisma.$transaction(async (tx) => {
        const currentLock = await tx.systemLock.findUnique({
          where: { key }
        })

        if (currentLock && currentLock.expiresAt > now) {
          // Lock still active
          return false
        }

        // 2. Lock is either missing or expired -> Claim it
        await tx.systemLock.upsert({
          where: { key },
          update: {
            ownerId: OWNER_ID,
            lockedAt: now,
            expiresAt
          },
          create: {
            key,
            ownerId: OWNER_ID,
            lockedAt: now,
            expiresAt
          }
        })

        return true
      })
    } catch (e) {
      console.error(`✕ [LockService] Failed to acquire lock for ${key}:`, e)
      return false
    }
  }

  /**
   * Utility for executing a block of code only once across the cluster.
   */
  static async runOnce(key: string, ttlMs: number, fn: () => Promise<void>) {
    const acquired = await this.tryAcquireLock(key, ttlMs)
    if (acquired) {
      try {
        await fn()
      } catch (e) {
        console.error(`✕ [LockService] Error executing job ${key}:`, e)
      }
    }
  }
}
