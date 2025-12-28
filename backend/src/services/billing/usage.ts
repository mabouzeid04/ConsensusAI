import { PrismaClient } from '../../generated/prisma/client';

const prisma = new PrismaClient();

export type UsageParams = {
  userId: string;
  clientId?: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheCreateTokens?: number;
  cacheReadTokens?: number;
  rateInPer1kCents: number;
  rateOutPer1kCents: number;
  costCents: number;
  requestId: string;
  rawUsage?: any;
};

export async function recordUsage(params: UsageParams) {
  const {
    userId,
    clientId,
    provider,
    model,
    inputTokens = 0,
    outputTokens = 0,
    cacheCreateTokens = 0,
    cacheReadTokens = 0,
    rateInPer1kCents,
    rateOutPer1kCents,
    costCents,
    requestId,
    rawUsage,
  } = params;

  return prisma.usageLog.create({
    data: {
      userId,
      clientId: clientId || null,
      provider,
      model,
      inputTokens,
      outputTokens,
      cacheCreateTok: cacheCreateTokens,
      cacheReadTok: cacheReadTokens,
      rateInPer1kCents,
      rateOutPer1kCents,
      costCents,
      currency: 'USD',
      requestId,
      rawUsage: rawUsage as any,
    },
  });
}
