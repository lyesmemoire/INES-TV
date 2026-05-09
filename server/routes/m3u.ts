import { Router } from 'express';
import { prisma } from '../services/db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/supabaseAuth.middleware';



export const m3uRouter = Router();

// Get all M3U sources
m3uRouter.get('/', async (req, res) => {
  try {
    const sources = await prisma.playlist.findMany({
      where: { type: 'M3U' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch M3U sources' });
  }
});

// Add a new M3U source
m3uRouter.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const newSource = await prisma.playlist.create({
      data: { name, url, type: 'M3U' }
    });
    res.status(201).json(newSource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create M3U source' });
  }
});

// Update an M3U source
m3uRouter.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { name, url, isActive } = req.body;

    const updated = await prisma.playlist.update({
      where: { id },
      data: { name, url }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update M3U source' });
  }
});

// Delete an M3U source
m3uRouter.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    await prisma.playlist.delete({ where: { id } });
    res.json({ message: 'M3U source deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete M3U source' });
  }
});
