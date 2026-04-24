import { PrismaClient } from '@prisma/client';

/**
 * 💎 PRISMA CLIENT SINGLETON (Phase 60)
 * Optimized for high-concurrency Node.js backend.
 */
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
