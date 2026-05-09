import express from "express";
import { prisma } from "../services/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required.');
}

/**
 * 🔐 LOGIN STEP 1
 * Initial credential check (Email + Password)
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (admin.twoFAEnabled) {
      return res.json({ requires2FA: true, adminId: admin.id });
    }

    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('[AdminLogin] Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔐 LOGIN STEP 2 (2FA)
 * Verify TOTP code from Google Authenticator
 */
router.post("/2fa/verify", async (req, res) => {
  const { adminId, code } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.twoFASecret) {
      return res.status(400).json({ error: "2FA not initialized for this account" });
    }

    const verified = speakeasy.totp.verify({
      secret: admin.twoFASecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) return res.status(401).json({ error: "Invalid 2FA code" });

    const token = jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (err) {
    console.error('[2FAVerify] Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔐 SETUP 2FA
 * Generate secret and QR code for the admin
 * ⚠️ PROTECTED: Requires active admin session
 */
router.post("/2fa/setup", adminAuth, async (req: any, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `INES TV Admin (${new Date().toLocaleDateString()})`,
    });

    const qr = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      base32: secret.base32,
      qr,
    });
  } catch (err) {
    console.error('[2FASetup] Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔐 ENABLE 2FA
 * Activate 2FA on the admin account with the verified secret
 * ⚠️ PROTECTED: Requires active admin session. adminId from JWT, NOT from body.
 */
router.post("/2fa/enable", adminAuth, async (req: any, res) => {
  // 🔒 adminId comes from verified JWT, NOT from request body
  const adminId = req.admin?.adminId;
  const { secret } = req.body;

  if (!adminId) {
    return res.status(401).json({ error: "Admin session required" });
  }

  if (!secret) {
    return res.status(400).json({ error: "Missing 2FA secret" });
  }

  try {
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFASecret: secret,
        twoFAEnabled: true,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[2FAEnable] Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔐 UNIFIED MOBILE LOGIN
 * One-step credentials + 2FA check for Mobile App UX
 */
router.post("/login-mobile", async (req, res) => {
  const { email, password, code } = req.body;

  try {
    const admin = await (prisma as any).admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // If 2FA is enabled, we require the code in the same request for Mobile flow
    if (admin.twoFAEnabled) {
      if (!code) return res.status(400).json({ error: "2FA code required", requires2FA: true });
      
      const verified = speakeasy.totp.verify({
        secret: admin.twoFASecret,
        encoding: "base32",
        token: String(code),
      });

      if (!verified) return res.status(401).json({ error: "Invalid 2FA code" });
    }

    const token = jwt.sign({ adminId: admin.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '7d' }); // Longer for mobile
    res.json({ token, user: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error('[MobileLogin] Error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
