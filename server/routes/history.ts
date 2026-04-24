import express, { Router } from 'express';
import { prisma } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/supabaseAuth.middleware';


export const historyRouter = Router();

// Get watch history for the logged-in user
historyRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const history = await prisma.watchHistory.findMany({
      where: { userId },
      include: {
        channel: true
      },
      orderBy: {
        watchedAt: 'desc'
      },
      take: 50 // Limit to last 50 entries
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

// Get history for a specific channel
historyRouter.get('/:channelId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { channelId } = req.params;
    
    const entry = await prisma.watchHistory.findFirst({
      where: { userId, channelId },
      orderBy: { watchedAt: 'desc' }
    });

    res.json(entry || { lastPosition: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channel history' });
  }
});

// Add or update an entry in watch history
historyRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { channelId, durationSec, lastPosition, channelData } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    // Ensure channel exists
    await prisma.channel.upsert({
      where: { id: channelId },
      update: {},
      create: {
        id: channelId,
        name: channelData?.name || 'Unknown',
        category: channelData?.category || 'General',
        thumbnail: channelData?.thumbnail,
        streamUrl: channelData?.streamUrl || ''
      }
    });

    // Update or create history entry using the new unique constraint
    // Update or create history entry manually since no @@unique index exists on [userId, channelId]
    let entry = await prisma.watchHistory.findFirst({
      where: { userId, channelId },
    });

    if (entry) {
      entry = await prisma.watchHistory.update({
        where: { id: entry.id },
        data: {
          watchedAt: new Date(),
          durationSec: { increment: durationSec || 0 },
          lastPosition: lastPosition !== undefined ? lastPosition : undefined
        },
        include: { channel: true }
      });
    } else {
      entry = await prisma.watchHistory.create({
        data: {
          userId,
          channelId,
          durationSec: durationSec || 0,
          lastPosition: lastPosition || 0
        },
        include: { channel: true }
      });
    }

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update watch history' });
  }
});

// Clear watch history
historyRouter.delete('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    await prisma.watchHistory.deleteMany({
      where: { userId }
    });
    res.json({ message: 'Watch history cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear watch history' });
  }
});
