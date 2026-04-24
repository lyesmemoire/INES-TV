import { Router, Response } from 'express';
import { billingService } from '../services/billing.service';
import { requireAuth, AuthRequest } from '../middleware/supabaseAuth.middleware';
import logger from '../services/logger';


export const billingRouter = Router();

/**
 * POST /api/billing/create-checkout
 * Creates a Stripe checkout session for the authenticated user.
 */
billingRouter.post('/create-checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { planType } = req.body; // PREMIUM | PRO
    if (!['PREMIUM', 'PRO'].includes(planType)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 💳 Execute Stripe Checkout Creation
    const session = await billingService.createCheckoutSession(userId, planType);
    
    res.json({ url: session.url });
  } catch (error: any) {
    logger.error(`[Billing API] Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/billing/webhook
 * Stripe webhook endpoint.
 * NOTE: Needs raw body for signature verification.
 */
billingRouter.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Webhook Error: Missing signature');
  }

  try {
    // In a real express setup, this requires express.raw({type: 'application/json'})
    // for this specific route.
    const result = await billingService.handleWebhook(sig as string, req.body);
    res.json(result);
  } catch (err: any) {
    logger.error(`[Webhook Route] Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
