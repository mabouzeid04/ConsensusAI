// Lightweight estimation utils; replace with precise tokenizers if needed

export type Provider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'xai';

function estimateByChars(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // heuristic ~4 chars per token
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function estimatePromptTokens(provider: Provider, model: string, prompt: string): number {
  // Simple heuristic for now; can branch by provider/model
  return estimateByChars(prompt);
}

export function estimateOutputTokens(provider: Provider, model: string, output: string, maxOutputTokens?: number): number {
  const est = estimateByChars(output);
  if (maxOutputTokens && est > maxOutputTokens) return maxOutputTokens;
  return est;
}

export function estimateWorstCaseTokens(
  provider: Provider,
  model: string,
  prompt: string,
  maxOutputTokens: number
): { inputTokens: number; outputTokens: number } {
  const inputTokens = estimatePromptTokens(provider, model, prompt);
  const outputTokens = maxOutputTokens;
  return { inputTokens, outputTokens };
}


