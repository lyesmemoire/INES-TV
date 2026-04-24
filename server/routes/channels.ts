import pkg, { Request, Response, NextFunction } from 'express';
const { Router } = pkg;
import { getLiveFixtures, maskApiKey, getCacheInfo, invalidateCache } from '../services/sportsService';
import { getM3UChannels } from '../services/m3uService';
import { prisma } from '../services/db';
import { ApiChannel } from '../types';

import { optionalAuth, AuthRequest } from '../middleware/supabaseAuth.middleware';


const router = Router();

/**
 * GET /api/channels/live
 * Lightweight endpoint for the high-engagement homepage feed.
 * Returns only active/live matches from the database.
 */
router.get('/live', async (_req: Request, res: Response) => {
  try {
    const activeMatches = await prisma.channel.findMany({
      where: { 
        isActive: true,
        status: { in: ['LIVE', 'UPCOMING'] }
      },
      orderBy: { status: 'desc' } // LIVE first
    });
    res.json(activeMatches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
});

/**
 * GET /api/live-channels
 * Returns merged live football fixtures + M3U video streams.
 * Falls back to M3U-only channels if no live fixtures are available.
 */
router.get('/live-channels', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = process.env.SPORTS_API_KEY ?? '36eed17da33df1d180aaf9f6eca0ce15';
    const [m3uChannels, liveFixtures] = await Promise.all([
      Promise.resolve(getM3UChannels()),
      getLiveFixtures(apiKey),
    ]);

    const userPlan = req.user?.plan ?? 'FREE';
    let channels: any[];

    if (liveFixtures.length > 0) {
      // Merge: each live fixture gets a real M3U video stream round-robin
      channels = liveFixtures.map((fixture, i) => {
        const stream = m3uChannels[i % m3uChannels.length];
        return {
          id: fixture.fixture.id.toString(),
          channelId: stream.id ?? `channel-${i}`,
          name: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
          category: fixture.league.name,
          viewers: fixture.fixture.status.elapsed
            ? `${fixture.fixture.status.elapsed}'`
            : 'LIVE',
          thumbnail: fixture.league.logo || stream.thumbnail,
          score: `${fixture.goals.home ?? 0} - ${fixture.goals.away ?? 0}`,
          homeLogo: fixture.teams.home.logo,
          awayLogo: fixture.teams.away.logo,
          plans: ['FREE', 'BASIC', 'PREMIUM'],
          accessible: true
        };
      });
    } else {
      // No live matches — use raw M3U channels and fetch current EPG
      const now = new Date();
      
      channels = await Promise.all(m3uChannels.map(async (ch) => {
        const program = await prisma.program.findFirst({
          where: {
            channelId: ch.id,
            startTime: { lte: now },
            endTime: { gte: now },
          }
        });
        
        return {
          id: ch.id,
          channelId: ch.id,
          name: ch.name,
          category: ch.category,
          thumbnail: ch.thumbnail,
          currentProgram: program ? { 
            title: program.title, 
            description: program.description || undefined 
          } : null,
          plans: ['FREE', 'BASIC', 'PREMIUM'],
          accessible: true
        };
      }));
    }

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      status: 'ok',
      message: liveFixtures.length > 0
        ? `${liveFixtures.length} live match(es) merged.`
        : `No live matches. Showing ${m3uChannels.length} TV channels.`,
      channels,
    });

  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/channels/trending
 * Returns the most popular channels based on recent stream events.
 */
router.get('/trending', async (req: Request, res: Response) => {
    try {
        const topPlayed = await prisma.streamEvent.groupBy({
            by: ['channelId'],
            _count: { channelId: true },
            orderBy: { _count: { channelId: 'desc' } },
            take: 10
        });

        const channelIds = topPlayed.map(p => p.channelId);
        const channels = await prisma.channel.findMany({
            where: { id: { in: channelIds } }
        });

        res.json({ status: 'ok', channels });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch trending channels' });
    }
});

/**
 * GET /api/channels/recommended
 * Real-time personalized recommendations based on user history.
 */
router.get('/recommended', async (req: any, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.json({ status: 'ok', channels: [] });

        const history = await prisma.watchHistory.findMany({
            where: { userId },
            include: { channel: true },
            orderBy: { watchedAt: 'desc' },
            take: 20
        });

        const historyWithChannels = history.filter(h => h.channel);
        const categories = [...new Set(historyWithChannels.map(h => h.channel!.category))];
        
        const watchedChannelIds = historyWithChannels.map(h => h.channelId).filter(Boolean) as string[];

        const recommendations = await prisma.channel.findMany({
            where: { 
                category: { in: categories },
                NOT: { id: { in: watchedChannelIds } }
            },
            take: 12
        });

        res.json({ status: 'ok', channels: recommendations });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

/**
 * GET /api/cache/info
 * Returns current cache diagnostic info (useful for debugging without restarting server).
 */
router.get('/cache/info', (_req: Request, res: Response) => {
  res.json({ status: 'ok', cache: getCacheInfo() });
});

/**
 * DELETE /api/cache
 * Invalidates the in-memory sports cache (forces fresh API call on next request).
 */
router.delete('/cache', (_req: Request, res: Response) => {
  invalidateCache();
  res.json({ status: 'ok', message: 'Cache invalidated. Next /api/live-channels will hit the sports API.' });
});

export default router;
