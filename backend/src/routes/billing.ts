import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getBalance, credit } from '../services/billing/wallet';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/wallet', requireAuth, async (req, res) => {
  const userId = (req as any).user?.userId as string;
  const balanceCents = await getBalance(userId);
  res.json({ balanceCents, balanceUsd: (balanceCents / 100).toFixed(2) });
});

router.post('/wallet/credit', requireAuth, async (req, res) => {
  const userId = (req as any).user?.userId as string;
  const { amountCents } = req.body as { amountCents: number };
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return res.status(400).json({ error: 'amountCents must be > 0' });
  }
  const wallet = await credit(userId, Math.round(amountCents));
  res.json({ balanceCents: wallet.balanceCents, balanceUsd: (wallet.balanceCents / 100).toFixed(2) });
});

router.get('/usage', requireAuth, async (req, res) => {
  const userId = (req as any).user?.userId as string;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const cursor = (req.query.cursor as string) || undefined;

  const rows = await prisma.usageLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      createdAt: true,
      provider: true,
      model: true,
      inputTokens: true,
      outputTokens: true,
      costCents: true,
      clientId: true,
    },
  });

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
  res.json({ items: rows, nextCursor });
});

export { router as billingRouter };
