export type Pricing = {
  inputPer1kCents: number;
  outputPer1kCents: number;
  cacheCreatePer1kCents?: number;
  cacheReadPer1kCents?: number;
};

// NOTE: Keep these conservative and update as needed. Values are in CENTS per 1K tokens.
// Placeholders should be replaced with your actual contracted/provider rates.
const PRICING_TABLE: Record<string, Pricing> = {
  // OpenAI (examples)
  'openai:gpt-5': { inputPer1kCents: 0.125, outputPer1kCents: 1 },
  'openai:gpt-5-mini': { inputPer1kCents: 0.025, outputPer1kCents: 0.2 },

  // Anthropic
  'anthropic:claude-sonnet-4-5-20250929': { inputPer1kCents: 0.3, outputPer1kCents: 1.5 },

  // DeepSeek (OpenAI-compatible)
  'deepseek:deepseek-reasoner': { inputPer1kCents: 0.028, outputPer1kCents: 0.042 },
  'deepseek:DeepSeek-V3.2-Exp': { inputPer1kCents: 0.028, outputPer1kCents: 0.042 },

  // Google Gemini (approx; replace with your actual rates)
  'google:gemini-2.5-flash': { inputPer1kCents: 0.03, outputPer1kCents: 0.25 },
  'google:gemini-2.5-pro': { inputPer1kCents: 0.125, outputPer1kCents: 1 },

  // xAI Grok
  'xai:grok-4': { inputPer1kCents: 0.3, outputPer1kCents: 1.5 },
};

export function getPricingKey(provider: string, model: string): string {
  return `${provider}:${model}`;
}

export function getPricing(provider: string, model: string): Pricing | null {
  const key = getPricingKey(provider, model);
  return PRICING_TABLE[key] || null;
}

export function calculateCostCents(
  provider: string,
  model: string,
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    cacheCreateTokens?: number;
    cacheReadTokens?: number;
  }
): number {
  const pricing = getPricing(provider, model);
  if (!pricing) return 0;
  const inUsdCents = ((usage.inputTokens ?? 0) / 1000) * pricing.inputPer1kCents;
  const outUsdCents = ((usage.outputTokens ?? 0) / 1000) * pricing.outputPer1kCents;
  const cacheCreate = ((usage.cacheCreateTokens ?? 0) / 1000) * (pricing.cacheCreatePer1kCents ?? 0);
  const cacheRead = ((usage.cacheReadTokens ?? 0) / 1000) * (pricing.cacheReadPer1kCents ?? 0);
  return Math.round(inUsdCents + outUsdCents + cacheCreate + cacheRead);
}


