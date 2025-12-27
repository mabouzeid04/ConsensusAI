import { Request, Response } from 'express';
import { 
  fetchGpt5LowResponse,
  fetchGpt5HighResponse,
  fetchClaude45SonnetResponse,
  fetchDeepSeekR1Response,
  fetchDeepSeekV3Response,
  fetchGemini2Response,
  fetchGemini25ProResponse,
  fetchGrok4Response,
  
  fetchGpt5LowEvaluation,
  fetchGpt5HighEvaluation,
  fetchClaude45SonnetEvaluation,
  fetchDeepSeekR1Evaluation,
  fetchDeepSeekV3Evaluation,
  fetchGemini2Evaluation,
  fetchGemini25ProEvaluation,
  fetchGrok4Evaluation,
  fetchGpt5LowResponseWithUsage,
  fetchGpt5HighResponseWithUsage,
  fetchClaude45SonnetResponseWithUsage,
  fetchDeepSeekR1ResponseWithUsage,
  fetchDeepSeekV3ResponseWithUsage,
  fetchGemini2ResponseWithUsage,
  fetchGemini25ProResponseWithUsage,
  fetchGrok4ResponseWithUsage,
} from '../services/aiServices';
import { createComparison } from '../services/historyService';
import { verifyAuthToken } from '../utils/jwt';
import { estimateWorstCaseTokens } from '../services/billing/tokenize';
import { calculateCostCents, getPricing } from '../services/billing/pricing';
import { debitForUsageTx, getBalance } from '../services/billing/wallet';
import { recordUsage } from '../services/billing/usage';
import { generateTitleFromPrompt, fallbackTitleFromPrompt } from '../services/title';

// Type definitions
interface ModelResponse {
  id?: string; // model id for filtering
  model: string;
  response: string;
  label?: string;
}

interface Evaluation {
  model: string;
  score: number;
  explanation: string;
}

interface ResponseWithEvaluations {
  label: string;
  model: string;
  response: string;
  evaluations: Evaluation[];
}

// Controller functions
const MODEL_REGISTRY = {
  gpt5_low: {
    label: 'OpenAI GPT-5 Low',
    respond: fetchGpt5LowResponse,
    respondWithUsage: fetchGpt5LowResponseWithUsage,
    provider: 'openai' as const,
    evaluate: fetchGpt5LowEvaluation,
  },
  gpt5_high: {
    label: 'OpenAI GPT-5 High',
    respond: fetchGpt5HighResponse,
    respondWithUsage: fetchGpt5HighResponseWithUsage,
    provider: 'openai' as const,
    evaluate: fetchGpt5HighEvaluation,
  },
  claude_45_sonnet: {
    label: 'Claude 4.5 Sonnet',
    respond: fetchClaude45SonnetResponse,
    respondWithUsage: fetchClaude45SonnetResponseWithUsage,
    provider: 'anthropic' as const,
    evaluate: fetchClaude45SonnetEvaluation,
  },
  deepseek_r1: {
    label: 'DeepSeek R1',
    respond: fetchDeepSeekR1Response,
    respondWithUsage: fetchDeepSeekR1ResponseWithUsage,
    provider: 'deepseek' as const,
    evaluate: fetchDeepSeekR1Evaluation,
  },
  deepseek_v3: {
    label: 'DeepSeek V3',
    respond: fetchDeepSeekV3Response,
    respondWithUsage: fetchDeepSeekV3ResponseWithUsage,
    provider: 'deepseek' as const,
    evaluate: fetchDeepSeekV3Evaluation,
  },
  gemini_20_flash: {
    label: 'Gemini 2.5 Flash',
    respond: fetchGemini2Response,
    respondWithUsage: fetchGemini2ResponseWithUsage,
    provider: 'google' as const,
    evaluate: fetchGemini2Evaluation,
  },
  gemini_25_pro: {
    label: 'Gemini 2.5 Pro',
    respond: fetchGemini25ProResponse,
    respondWithUsage: fetchGemini25ProResponseWithUsage,
    provider: 'google' as const,
    evaluate: fetchGemini25ProEvaluation,
  },
  grok_4: {
    label: 'Grok 4',
    respond: fetchGrok4Response,
    respondWithUsage: fetchGrok4ResponseWithUsage,
    provider: 'xai' as const,
    evaluate: fetchGrok4Evaluation,
  },
} as const;
type ModelId = keyof typeof MODEL_REGISTRY;

export const getModelResponses = async (req: Request, res: Response) => {
  try {
    const { prompt, generators } = req.body as { prompt: string; generators?: ModelId[] };
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const userId = (req as any).user?.userId as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const chosen: ModelId[] = (generators?.length ? generators : (Object.keys(MODEL_REGISTRY) as ModelId[]));

    // Precheck wallet with worst-case estimates
    const worstCaseCosts = chosen.map((id) => {
      const provider = MODEL_REGISTRY[id].provider;
      const pricing = getPricing(provider, MODEL_REGISTRY[id].label);
      // pricing lookup key expects provider+model id; we used label here; adjust below.
      return { id, provider };
    });
    // We compute after actual provider responses due to current pricing map using provider+raw model id.
    // To still guard, assume small buffer: require at least $0.01.
    const balance = await getBalance(userId);
    if (balance < 1) {
      return res.status(402).json({ error: 'Insufficient funds', code: 'INSUFFICIENT_FUNDS' });
    }

    const settled = await Promise.allSettled(
      chosen.map(async (id) => {
        const withUsage = await MODEL_REGISTRY[id].respondWithUsage(prompt);
        // Calculate cost
        const provider = MODEL_REGISTRY[id].provider as any;
        const model = withUsage.model;
        const costCents = calculateCostCents(provider, model, {
          inputTokens: withUsage.usage.inputTokens,
          outputTokens: withUsage.usage.outputTokens,
          cacheCreateTokens: withUsage.usage.cacheCreateTokens,
          cacheReadTokens: withUsage.usage.cacheReadTokens,
        });

        const requestId = `${Date.now()}-${id}-${Math.random().toString(36).slice(2)}`;
        try {
          await debitForUsageTx(userId, costCents, requestId);
          await recordUsage({
            userId,
            clientId: (req.headers['x-client-id'] as string) || undefined,
            provider,
            model,
            inputTokens: withUsage.usage.inputTokens,
            outputTokens: withUsage.usage.outputTokens,
            cacheCreateTokens: withUsage.usage.cacheCreateTokens,
            cacheReadTokens: withUsage.usage.cacheReadTokens,
            rateInPer1kCents: getPricing(provider, model)?.inputPer1kCents || 0,
            rateOutPer1kCents: getPricing(provider, model)?.outputPer1kCents || 0,
            costCents,
            requestId,
            rawUsage: withUsage,
          });
        } catch (e: any) {
          if (e?.code === 'INSUFFICIENT_FUNDS') {
            throw Object.assign(new Error('Insufficient funds'), { code: 'INSUFFICIENT_FUNDS' });
          }
          throw e;
        }

        return { id, model: MODEL_REGISTRY[id].label, response: withUsage.text } as ModelResponse;
      })
    );

    const modelResponses: ModelResponse[] = [];
    settled.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        modelResponses.push(r.value);
      } else {
        console.error(`Error fetching response for ${MODEL_REGISTRY[chosen[idx]].label}:`, r.reason);
      }
    });

    // If no model responses were successfully fetched, return an error
    if (modelResponses.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch any model responses' });
    }

    // Shuffle responses and assign labels
    const shuffledResponses = shuffleAndLabelResponses([...modelResponses]);
    
    // Store the original model-response mapping in session or temporary storage
    // For simplicity, we'll return it to the frontend to be sent back
    // In a production app, this should be stored securely on the backend
    
    res.status(200).json({ 
      shuffledResponses,
      originalMapping: modelResponses
    });
  } catch (error) {
    console.error('Error fetching model responses:', error);
    const code = (error as any)?.code;
    if (code === 'INSUFFICIENT_FUNDS') {
      return res.status(402).json({ error: 'Insufficient funds', code: 'INSUFFICIENT_FUNDS' });
    }
    res.status(500).json({ error: 'Failed to fetch model responses' });
  }
};

export const evaluateResponses = async (req: Request, res: Response) => {
  try {
    const { prompt, shuffledResponses, originalMapping, judges } = req.body as { prompt: string; shuffledResponses: ModelResponse[]; originalMapping: ModelResponse[]; judges?: ModelId[] };
    
    if (!prompt || !shuffledResponses || !originalMapping) {
      return res.status(400).json({ error: 'Prompt, shuffled responses, and original mapping are required' });
    }

    // Judges default to responders (self-judging allowed)
    const respondersPresent = (originalMapping as ModelResponse[]).map(m => m.id).filter(Boolean) as ModelId[];
    const chosenJudges: ModelId[] = (judges && judges.length ? judges : respondersPresent);

    const evaluationPromises = chosenJudges.map(id => evaluateResponsesWithModelId(id, prompt, shuffledResponses));
    const allEvaluationsResults = await Promise.allSettled(evaluationPromises);

    const evaluationsByModel: Array<Array<{ score: number, explanation: string }>> = allEvaluationsResults.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return (shuffledResponses as ModelResponse[]).map(() => ({
        score: 0,
        explanation: `Evaluation with ${MODEL_REGISTRY[chosenJudges[i]].label} failed`
      }));
    });

    // Organize evaluations by response
    const responsesWithEvaluations: ResponseWithEvaluations[] = shuffledResponses.map((response: ModelResponse, index: number) => {
      // Find original model for this response
      const originalModel = originalMapping.find(
        (item: ModelResponse) => item.response === response.response
      )?.model || 'Unknown';

      // Collect all evaluations for this response
      const evaluations = evaluationsByModel.map((modelEval, evalIndex) => ({
        model: MODEL_REGISTRY[chosenJudges[evalIndex]].label || 'Unknown',
        score: modelEval?.[index]?.score ?? 0,
        explanation: modelEval?.[index]?.explanation ?? 'Evaluation failed'
      }));

      return {
        label: response.label || '',
        model: originalModel,
        response: response.response,
        evaluations
      };
    });

    // Persist comparison
    const clientId = (req.headers['x-client-id'] as string) || '';
    // Try to read user from auth cookie if present
    const token = (req as any).cookies?.auth || '';
    const payload = token ? verifyAuthToken(token) : null;
    let comparisonId: string | undefined = undefined;
    if (clientId) {
      try {
        // Generate a title with fallback to prompt snippet
        const generatedTitle = await generateTitleFromPrompt(prompt);
        const safeTitle = generatedTitle || fallbackTitleFromPrompt(prompt, 10);
        const created = await createComparison({
          clientId,
          userId: payload?.userId || null,
          prompt,
          title: safeTitle,
          generators: (originalMapping as ModelResponse[]).map(m => m.id as string).filter(Boolean),
          judges: (chosenJudges as string[]),
          data: { prompt, responsesWithEvaluations },
        });
        comparisonId = created.id;
      } catch (err) {
        console.error('Failed to persist comparison:', err);
      }
    }

    res.status(200).json({ 
      prompt,
      responsesWithEvaluations,
      comparisonId,
    });
  } catch (error) {
    console.error('Error evaluating responses:', error);
    res.status(500).json({ error: 'Failed to evaluate responses' });
  }
};

// Helper functions
function shuffleAndLabelResponses(responses: ModelResponse[]): ModelResponse[] {
  // Fisher-Yates shuffle algorithm
  for (let i = responses.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [responses[i], responses[j]] = [responses[j], responses[i]];
  }
  
  // Assign labels A through E
  const labels = ['A', 'B', 'C', 'D', 'E'];
  return responses.map((response, index) => ({
    ...response,
    label: labels[index]
  }));
}

async function evaluateResponsesWithModelId(
  id: ModelId,
  prompt: string,
  responses: ModelResponse[]
): Promise<Array<{ score: number, explanation: string }>> {
  const evaluationFunction = MODEL_REGISTRY[id].evaluate;
  try {
    return await evaluationFunction(prompt, responses);
  } catch (error) {
    console.error(`Error during evaluation with ${MODEL_REGISTRY[id].label}:`, error);
    return responses.map(() => ({
      score: 0,
      explanation: `Evaluation with ${MODEL_REGISTRY[id].label} failed`
    }));
  }
}

