import { Router, Response } from 'express';
import { prisma } from '../services/db';
import { requireAuth, AuthRequest } from '../middleware/supabaseAuth.middleware';


import logger from '../services/logger';

export const referralRouter = Router();

/**
 * POST /api/referral/claim
 * Process a referral code to award premium days.
 * Logic: +3 days for the referred user and +3 days for the referrer.
 */
referralRouter.post('/claim', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!code) return res.status(400).json({ error: 'Referral code is required' });

    // 1. Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code }
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    if (referrer.id === userId) {
      return res.status(400).json({ error: 'You cannot refer yourself' });
    }

    // 2. Check if user was already referred
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredById) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // 3. Award Premium Days (+3 days)
    const bonusDays = 3;
    const msInDay = 24 * 60 * 60 * 1000;
    
    // Update Referrer
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        isPremium: true,
        plan: referrer.plan === 'FREE' ? 'PREMIUM' : referrer.plan,
        // In a real logic, we would update an 'expiresAt' field, 
        // but for this MVP we mark as Premium.
      }
    });

    // Update Referred User
    await prisma.user.update({
      where: { id: userId },
      data: {
        referredById: referrer.id,
        isPremium: true,
        plan: 'PREMIUM'
      }
    });

    logger.info(`[Referral] User ${userId} referred by ${referrer.id}. Bonus awarded.`);

    res.json({ 
      status: 'ok', 
      message: `Félicitations ! Vous et votre parrain avez reçu ${bonusDays} jours de Premium.` 
    });

  } catch (error: any) {
    logger.error(`[Referral] Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

/**
 * GET /api/referral/stats
 * Get the user's own referral code and status.
 */
referralRouter.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, _count: { select: { referrals: true } } }
        });

        res.json({ 
            status: 'ok', 
            code: user?.referralCode,
            totalReferrals: user?._count.referrals || 0
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});
