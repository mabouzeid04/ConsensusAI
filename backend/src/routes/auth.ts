import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '../generated/prisma/client';
import { getCookieOptions, signAuthToken } from '../utils/jwt';
import { optionalAuth } from '../middleware/auth';
import { attachGuestHistoryToUser } from '../services/historyService';

const prisma = new PrismaClient();
const router = express.Router();

export function configureGoogleStrategy() {
  const clientID = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  if (!clientID || !clientSecret) return;
  passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL }, async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(null, false);
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email, name: profile.displayName || null, imageUrl: profile.photos?.[0]?.value || null } });
      }
      return done(null, { id: user.id, email: user.email });
    } catch (e) {
      return done(e as any);
    }
  }));
}

router.get('/me', optionalAuth, async (req, res) => {
  if (!req.user) return res.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, imageUrl: true } });
  res.json({ user });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const emailNorm = String(email).toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email: emailNorm, passwordHash, name: name || null } });

    const token = signAuthToken({ userId: user.id, email: user.email });
    res.cookie('auth', token, getCookieOptions());
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (clientId) {
      try { await attachGuestHistoryToUser(user.id, clientId); } catch {}
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('Register error', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const emailNorm = String(email || '').toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signAuthToken({ userId: user.id, email: user.email });
    res.cookie('auth', token, getCookieOptions());
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (clientId) {
      try { await attachGuestHistoryToUser(user.id, clientId); } catch {}
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('Login error', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('auth', { ...getCookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

router.get('/google', (req, res, next) => {
  const clientId = (req.query.clientId as string) || undefined;
  return (passport.authenticate('google', { scope: ['profile', 'email'], state: clientId }))(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    return (passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login` }))(req, res, next);
  },
  async (req: any, res) => {
    const user = req.user as { id: string; email: string };
    const token = signAuthToken({ userId: user.id, email: user.email });
    res.cookie('auth', token, getCookieOptions());
    const clientId = (req.query.state as string) || '';
    if (clientId) {
      try { await attachGuestHistoryToUser(user.id, clientId); } catch {}
    }
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(frontendUrl);
  }
);

export { router as authRouter };


