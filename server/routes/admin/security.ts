import express, { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../../middleware/supabaseAuth.middleware';
import { SecurityService } from '../../services/security.service';
import { prisma } from '../../services/db';

const router = Router();

/**
 * GET /api/admin/security/stats
 * Aggregated security metrics for the last 24 hours.
 */
router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await SecurityService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security stats' });
  }
});

/**
 * GET /api/admin/security/logs
 * Recent security incident logs.
 */
router.get('/logs', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await SecurityService.getRecentLogs(limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
});

/**
 * GET /api/admin/security/active-sessions
 * List all currently active sessions with user details.
 */
router.get('/active-sessions', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { revoked: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

/**
 * POST /api/admin/security/sessions/:id/kill
 * Manually terminate a specific session.
 */
router.post('/sessions/:id/kill', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.session.update({
      where: { id },
      data: { revoked: true }
    });
    
    // Log the manual kill
    await SecurityService.logEvent({
      type: 'SESSION_KILLED',
      ip: req.ip || '0.0.0.0',
      details: `Manual session termination by Admin ${req.user?.id}`,
      severity: 'medium'
    });

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to terminate session' });
  }
});

/**
 * POST /api/admin/security/2fa/setup
 * Generates a TOTP secret and QR code for Google Authenticator setup.
 */
router.post('/2fa/setup', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const speakeasy = await import('speakeasy');
    const qrcode = await import('qrcode');
    
    const admin = await prisma.admin.findUnique({
        where: { id: req.user?.id }
    });

    const secret = speakeasy.default.generateSecret({
      name: `StreamPerf_PRO (${admin?.email || 'Admin'})`
    });

    // Save secret (temp) or return to client for immediate verification
    await prisma.admin.update({
        where: { id: req.user?.id },
        data: { twoFASecret: secret.base32 }
    });

    const qrCodeUrl = await qrcode.default.toDataURL(secret.otpauth_url!);
    res.json({ qrCode: qrCodeUrl, secret: secret.base32 });
  } catch (err) {
    console.error('[Security] 2FA Setup Error:', err);
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

/**
 * POST /api/admin/security/2fa/verify
 * Validates the TOTP token and enables 2FA for the account.
 */
router.post('/2fa/verify', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { token } = req.body;
        const speakeasy = await import('speakeasy');
        
        const admin = await prisma.admin.findUnique({
            where: { id: req.user?.id }
        });

        if (!admin || !admin.twoFASecret) {
            return res.status(400).json({ error: '2FA not initialized' });
        }

        const verified = speakeasy.default.totp.verify({
            secret: admin.twoFASecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            await prisma.admin.update({
                where: { id: admin.id },
                data: { twoFAEnabled: true }
            });
            return res.json({ success: true });
        } else {
            return res.status(400).json({ error: 'Invalid 2FA token' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

export default router;
