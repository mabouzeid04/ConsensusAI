import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

const STARTING_BALANCE_CENTS = 1000; // $10.00

export async function ensureWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wallet.create({ data: { userId, balanceCents: STARTING_BALANCE_CENTS } });
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await ensureWallet(userId);
  return wallet.balanceCents;
}

export async function credit(userId: string, amountCents: number) {
  if (amountCents <= 0) return await ensureWallet(userId);
  return prisma.wallet.upsert({
    where: { userId },
    create: { userId, balanceCents: STARTING_BALANCE_CENTS + amountCents },
    update: { balanceCents: { increment: amountCents } },
  });
}

export async function debitForUsageTx(userId: string, amountCents: number, requestId: string) {
  if (amountCents <= 0) return await ensureWallet(userId);
  return prisma.$transaction(async (tx) => {
    // Idempotency: if a usage with this requestId already exists, skip debit here.
    const existing = await tx.usageLog.findUnique({ where: { requestId } });
    if (existing) {
      return await tx.wallet.findUnique({ where: { userId } });
    }

    const wallet = await tx.wallet.upsert({
      where: { userId },
      create: { userId, balanceCents: STARTING_BALANCE_CENTS },
      update: {},
    });
    if (wallet.balanceCents < amountCents) {
      throw Object.assign(new Error('INSUFFICIENT_FUNDS'), { code: 'INSUFFICIENT_FUNDS' });
    }
    const updated = await tx.wallet.update({
      where: { userId },
      data: { balanceCents: { decrement: amountCents } },
    });
    return updated;
  });
}
