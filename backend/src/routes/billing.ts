import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getBalance, credit } from '../services/billing/wallet';
import { PrismaClient } from '../generated/prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const router = express.Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeSecret ? new Stripe(stripeSecret) : (null as any);

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

// Create Stripe Checkout session to top-up wallet
router.post('/checkout', requireAuth, async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
  const userId = (req as any).user?.userId as string;
  const { amountCents } = req.body as { amountCents: number };
  if (!Number.isFinite(amountCents) || amountCents < 50) {
    return res.status(400).json({ error: 'amountCents must be >= 50' });
  }

  const successUrlBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Wallet top-up' },
          unit_amount: Math.round(amountCents),
        },
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: `${successUrlBase}/account?topup=success`,
    cancel_url: `${successUrlBase}/account?topup=cancel`,
  });

  res.json({ url: session.url });
});

// Exported webhook handler to be mounted with express.raw in index.ts
export async function billingWebhookHandler(req: express.Request, res: express.Response) {
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;
  if (!webhookSecret) return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;
  try {
    // @ts-ignore body is a Buffer due to express.raw
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = (session.metadata?.userId as string) || '';
    const amount = session.amount_total ?? 0;
    if (userId && amount > 0) {
      await credit(userId, amount);
    }
  }

  return res.json({ received: true });
}

export { router as billingRouter };
