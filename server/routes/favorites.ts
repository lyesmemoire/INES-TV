import express, { Router } from 'express';
import { prisma } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/supabaseAuth.middleware';


export const favoritesRouter = Router();

// Get all favorites for the logged-in user
favoritesRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const favorites = await prisma.favoriteChannel.findMany({
      where: { userId },
      include: {
        channel: true // Fetch full channel details
      }
    });

    res.json(favorites.map(f => f.channel));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Toggle Favorite (Add or Remove)
favoritesRouter.post('/toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    // Since our channels come from an external API (M3U), they might not exist in Prisma yet.
    // If it doesn't exist, we must create a placeholder channel in the DB so the ForeignKey works.
    const existingChannel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!existingChannel) {
      const { channelData } = req.body; // Pass the channel metadata from frontend
      if (!channelData) {
        return res.status(400).json({ error: 'Channel does not exist in DB and channelData was not provided to cache it.' });
      }
      await prisma.channel.create({
        data: {
          id: channelId,
          name: channelData.name,
          category: channelData.category,
          thumbnail: channelData.thumbnail,
          streamUrl: channelData.streamUrl
        }
      });
    }

    const existingFav = await prisma.favoriteChannel.findUnique({
      where: {
        userId_channelId: { userId, channelId }
      }
    });

    if (existingFav) {
      // Remove favorite
      await prisma.favoriteChannel.delete({
        where: { id: existingFav.id }
      });
      return res.json({ status: 'removed', channelId });
    } else {
      // Add favorite
      const newFav = await prisma.favoriteChannel.create({
        data: { userId, channelId }
      });
      return res.status(201).json({ status: 'added', channelId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});
