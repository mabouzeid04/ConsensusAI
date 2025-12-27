import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface CreateComparisonParams {
  clientId: string;
  prompt: string;
  title?: string | null;
  generators?: string[];
  judges?: string[];
  data: any;
  userId?: string | null;
}

export async function createComparison(params: CreateComparisonParams) {
  const { clientId, prompt, title = null, generators = [], judges = [], data, userId = null } = params;
  const created = await prisma.comparison.create({
    data: {
      clientId,
      userId: userId || undefined,
      prompt,
      title: title || undefined,
      generators: generators as unknown as any,
      judges: judges as unknown as any,
      data: data as unknown as any,
    },
    select: { id: true },
  });
  return created;
}

export async function listComparisons(clientId: string, userId?: string | null) {
  const rows = await prisma.comparison.findMany({
    where: {
      OR: [
        { clientId },
        ...(userId ? [{ userId }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      prompt: true,
      title: true,
      createdAt: true,
      data: true,
    },
  });

  return rows.map((row) => {
    const data = row.data as any;
    const items = Array.isArray(data?.responsesWithEvaluations) ? data.responsesWithEvaluations : [];
    const numResponses = items.length;
    const bestAverage = items.reduce((best: number, item: any) => {
      const scores = Array.isArray(item?.evaluations) ? item.evaluations : [];
      const avg = scores.length
        ? scores.reduce((acc: number, e: any) => acc + (e?.score || 0), 0) / scores.length
        : 0;
      return Math.max(best, avg);
    }, 0);
    return {
      id: row.id,
      prompt: row.prompt,
      title: (row as any).title || null,
      createdAt: row.createdAt,
      summary: { numResponses, bestAverage },
    };
  });
}

export async function getComparison(id: string, clientId: string, userId?: string | null) {
  const row = await prisma.comparison.findFirst({
    where: {
      id,
      OR: [
        { clientId },
        ...(userId ? [{ userId }] : []),
      ],
    },
    select: { id: true, prompt: true, title: true, data: true, createdAt: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    prompt: row.prompt,
    title: (row as any).title || null,
    createdAt: row.createdAt,
    ...(row.data as any),
  };
}

export async function attachGuestHistoryToUser(userId: string, clientId: string) {
  if (!userId || !clientId) return { count: 0 };
  const result = await prisma.comparison.updateMany({
    where: { clientId, userId: null },
    data: { userId },
  });
  return { count: result.count };
}


