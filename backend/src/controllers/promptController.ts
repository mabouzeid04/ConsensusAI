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
export const getModelResponses = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Fetch responses from all models concurrently
    const [gpt4O1, gpt4O3, claudeSonnet, deepSeekR1, gemini2] = await Promise.allSettled([
      fetchGpt4O1Response(prompt),
      fetchGpt4O3Response(prompt),
      fetchClaudeSonnetResponse(prompt),
      fetchDeepSeekR1Response(prompt),
      fetchGemini2Response(prompt)
    ]);

    // Create array of model responses
    const modelResponses: ModelResponse[] = [];
    
    if (gpt4O1.status === 'fulfilled') {
      modelResponses.push({ model: 'OpenAI o1', response: gpt4O1.value });
    } else {
      console.error('Error fetching OpenAI o1 response:', gpt4O1.reason);
    }
    
    if (gpt4O3.status === 'fulfilled') {
      modelResponses.push({ model: 'OpenAI o3-mini', response: gpt4O3.value });
    } else {
      console.error('Error fetching OpenAI o3-mini response:', gpt4O3.reason);
    }
    
    if (claudeSonnet.status === 'fulfilled') {
      modelResponses.push({ model: 'Claude 3.7 Sonnet', response: claudeSonnet.value });
    } else {
      console.error('Error fetching Claude Sonnet response:', claudeSonnet.reason);
    }
    
    if (deepSeekR1.status === 'fulfilled') {
      modelResponses.push({ model: 'DeepSeek R1', response: deepSeekR1.value });
    } else {
      console.error('Error fetching DeepSeek R1 response:', deepSeekR1.reason);
    }
    
    if (gemini2.status === 'fulfilled') {
      modelResponses.push({ model: 'Gemini 2.0 Flash', response: gemini2.value });
    } else {
      console.error('Error fetching Gemini 2.0 Flash response:', gemini2.reason);
    }

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
    const { prompt, shuffledResponses, originalMapping } = req.body;
    
    if (!prompt || !shuffledResponses || !originalMapping) {
      return res.status(400).json({ error: 'Prompt, shuffled responses, and original mapping are required' });
    }

    const evaluationPromises = [];
    const models = ['OpenAI o1', 'OpenAI o3-mini', 'Claude 3.7 Sonnet', 'DeepSeek R1', 'Gemini 2.0 Flash'];
    
    // Use only available models for evaluation
    const availableModels = models.filter(model => 
      originalMapping.some((item: ModelResponse) => item.model === model)
    );

    // Get each model to evaluate all responses
    for (const model of availableModels) {
      const evaluationPromise = evaluateResponsesWithModel(model, prompt, shuffledResponses);
      evaluationPromises.push(evaluationPromise);
    }

    const allEvaluationsResults = await Promise.allSettled(evaluationPromises);
    
    // Filter successful evaluations
    const allEvaluations = allEvaluationsResults
      .filter((result): result is PromiseFulfilledResult<Array<{score: number, explanation: string}>> => 
        result.status === 'fulfilled')
      .map(result => result.value);
    
    // Organize evaluations by response
    const responsesWithEvaluations: ResponseWithEvaluations[] = shuffledResponses.map((response: ModelResponse, index: number) => {
      // Find original model for this response
      const originalModel = originalMapping.find(
        (item: ModelResponse) => item.response === response.response
      )?.model || 'Unknown';

      // Collect all evaluations for this response
      const evaluations = allEvaluations.map((modelEval, evalIndex) => {
        // Ensure modelEval and modelEval[index] exist
        if (!modelEval || !modelEval[index]) {
          return {
            model: availableModels[evalIndex] || 'Unknown',
            score: 0,
            explanation: 'Evaluation failed'
          };
        }
        
        return {
          model: availableModels[evalIndex],
          score: modelEval[index].score,
          explanation: modelEval[index].explanation
        };
      });

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

async function evaluateResponsesWithModel(
  model: string, 
  prompt: string, 
  responses: ModelResponse[]
): Promise<Array<{ score: number, explanation: string }>> {
  // Create a function that maps model names to their evaluation function
  const evaluationFunctions: Record<string, Function> = {
    'OpenAI o1': fetchGpt4O1Evaluation,
    'OpenAI o3-mini': fetchGpt4O3Evaluation,
    'Claude 3.7 Sonnet': fetchClaudeSonnetEvaluation,
    'DeepSeek R1': fetchDeepSeekR1Evaluation,
    'Gemini 2.0 Flash': fetchGemini2Evaluation
  };

  const evaluationFunction = evaluationFunctions[model];
  if (!evaluationFunction) {
    throw new Error(`No evaluation function for model: ${model}`);
  }

  try {
    return await evaluationFunction(prompt, responses);
  } catch (error) {
    console.error(`Error during evaluation with ${model}:`, error);
    // Return a default evaluation for each response
    return responses.map(() => ({
      score: 0,
      explanation: `Evaluation with ${model} failed`
    }));
  }
}

