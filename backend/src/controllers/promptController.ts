import { Request, Response } from 'express';
import { 
  fetchGpt4O1Response, 
  fetchGpt4O3Response, 
  fetchClaudeSonnetResponse,
  fetchDeepSeekR1Response,
  fetchGemini2Response,
  
  fetchGpt4O1Evaluation,
  fetchGpt4O3Evaluation,
  fetchClaudeSonnetEvaluation,
  fetchDeepSeekR1Evaluation,
  fetchGemini2Evaluation
} from '../services/aiServices';

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
  gpt4o_t07: {
    label: 'OpenAI GPT-4o (T0.7)',
    respond: fetchGpt4O1Response,
    evaluate: fetchGpt4O1Evaluation,
  },
  gpt4o_t10: {
    label: 'OpenAI GPT-4o (T1.0)',
    respond: fetchGpt4O3Response,
    evaluate: fetchGpt4O3Evaluation,
  },
  claude_37_sonnet: {
    label: 'Claude 3.7 Sonnet',
    respond: fetchClaudeSonnetResponse,
    evaluate: fetchClaudeSonnetEvaluation,
  },
  deepseek_r1: {
    label: 'DeepSeek R1',
    respond: fetchDeepSeekR1Response,
    evaluate: fetchDeepSeekR1Evaluation,
  },
  gemini_20_flash: {
    label: 'Gemini 2.0 Flash',
    respond: fetchGemini2Response,
    evaluate: fetchGemini2Evaluation,
  },
} as const;
type ModelId = keyof typeof MODEL_REGISTRY;

export const getModelResponses = async (req: Request, res: Response) => {
  try {
    const { prompt, generators } = req.body as { prompt: string; generators?: ModelId[] };
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const chosen: ModelId[] = (generators?.length ? generators : (Object.keys(MODEL_REGISTRY) as ModelId[]));

    const settled = await Promise.allSettled(
      chosen.map(async (id) => {
        const response = await MODEL_REGISTRY[id].respond(prompt);
        return { id, model: MODEL_REGISTRY[id].label, response } as ModelResponse;
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
    res.status(500).json({ error: 'Failed to fetch model responses' });
  }
};

export const evaluateResponses = async (req: Request, res: Response) => {
  try {
    const { prompt, shuffledResponses, originalMapping, judges } = req.body as { prompt: string; shuffledResponses: ModelResponse[]; originalMapping: ModelResponse[]; judges?: ModelId[] };
    
    if (!prompt || !shuffledResponses || !originalMapping) {
      return res.status(400).json({ error: 'Prompt, shuffled responses, and original mapping are required' });
    }

    // Judges default to responders (self-judging allowed); filter to those present in mapping
    const respondersPresent = (originalMapping as ModelResponse[]).map(m => m.id).filter(Boolean) as ModelId[];
    const chosenJudges: ModelId[] = (judges && judges.length ? judges : respondersPresent).filter(id => respondersPresent.includes(id));

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

    res.status(200).json({ 
      prompt,
      responsesWithEvaluations
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

