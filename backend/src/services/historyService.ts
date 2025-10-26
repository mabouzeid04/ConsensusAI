import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface CreateComparisonParams {
  clientId: string;
  prompt: string;
  generators?: string[];
  judges?: string[];
  data: any;
}

export async function createComparison(params: CreateComparisonParams) {
  const { clientId, prompt, generators = [], judges = [], data } = params;
  const created = await prisma.comparison.create({
    data: {
      clientId,
      prompt,
      generators: generators as unknown as any,
      judges: judges as unknown as any,
      data: data as unknown as any,
    },
    select: { id: true },
  });
  return created;
}

export async function listComparisons(clientId: string) {
  const rows = await prisma.comparison.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      prompt: true,
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
      createdAt: row.createdAt,
      summary: { numResponses, bestAverage },
    };
  });
}

export async function getComparison(id: string, clientId: string) {
  const row = await prisma.comparison.findFirst({
    where: { id, clientId },
    select: { id: true, prompt: true, data: true, createdAt: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    prompt: row.prompt,
    createdAt: row.createdAt,
    ...(row.data as any),
  };
}


