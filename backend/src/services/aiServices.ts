import axios from 'axios';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Add type declarations for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      GOOGLE_API_KEY: string;
      DEEPSEEK_API_KEY: string;
      // Optional/Additional providers
      GROK_API_KEY?: string;
      XAI_API_KEY?: string;
      // Model ID overrides (optional)
      OPENAI_GPT5_LOW_MODEL?: string;
      OPENAI_GPT5_HIGH_MODEL?: string;
      ANTHROPIC_SONNET_45_MODEL?: string;
      DEEPSEEK_V3_MODEL?: string;
      GROK_4_MODEL?: string;
      [key: string]: string | undefined;
    }
  }
}

dotenv.config();

// Types for model responses
interface ModelResponse {
  model: string;
  response: string;
  label?: string;
}

// Add response type interfaces
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnthropicResponse {
  content: Array<{
    text: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Responses API (OpenAI modern endpoint) minimal type for GPT-5 shape
interface OpenAIResponsesApiResponse {
  output: Array<{
    content: Array<{
      text: string;
    }>;
  }>;
}

// Shared axios instance with timeouts
const http = axios.create({
  timeout: 60000,
});

// Model IDs with sensible defaults, overridable via env
const OPENAI_GPT5_LOW_MODEL = process.env.OPENAI_GPT5_LOW_MODEL || 'gpt-5-mini';
const OPENAI_GPT5_HIGH_MODEL = process.env.OPENAI_GPT5_HIGH_MODEL || 'gpt-5';
const ANTHROPIC_SONNET_45_MODEL = process.env.ANTHROPIC_SONNET_45_MODEL || 'claude-4.5-sonnet';
const DEEPSEEK_V3_MODEL = process.env.DEEPSEEK_V3_MODEL || 'deepseek-v3';
const GROK_4_MODEL = process.env.GROK_4_MODEL || 'grok-4';

// -----------------
// OpenAI (GPT-5)
// -----------------
export async function fetchGpt5LowResponse(prompt: string): Promise<string> {
  try {
    const response = await http.post<OpenAIResponsesApiResponse>(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-5',
        input: prompt,
        reasoning: { effort: 'low' },
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.output[0].content[0].text;
  } catch (error) {
    console.error('Error fetching GPT-5 Low reasoning response:', error);
    throw error;
  }
}

export async function fetchGpt5HighResponse(prompt: string): Promise<string> {
  try {
    const response = await http.post<OpenAIResponsesApiResponse>(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-5',
        input: prompt,
        reasoning: { effort: 'high' },
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.output[0].content[0].text;
  } catch (error) {
    console.error('Error fetching GPT-5 High reasoning response:', error);
    throw error;
  }
}


export async function fetchClaudeSonnetResponse(prompt: string): Promise<string> {
  try {
    const apiResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    let content = '';
    if (apiResponse.content[0].type === 'text') {
      content = apiResponse.content[0].text;
    }
    return content;
  } catch (error) {
    console.error('Error fetching Claude 3.7 Sonnet response:', error);
    throw error;
  }
}

export async function fetchClaude45SonnetResponse(prompt: string): Promise<string> {
  try {
    const apiResponse = await anthropic.messages.create({
      model: ANTHROPIC_SONNET_45_MODEL,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    let content = '';
    if (apiResponse.content[0].type === 'text') {
      content = apiResponse.content[0].text;
    }
    return content;
  } catch (error) {
    console.error('Error fetching Claude 4.5 Sonnet response:', error);
    throw error;
  }
}

export async function fetchDeepSeekR1Response(prompt: string): Promise<string> {
  try {
    const response = await http.post<DeepSeekResponse>(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-reasoner',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching DeepSeek R1 response:', error);
    throw error;
  }
}

export async function fetchDeepSeekV3Response(prompt: string): Promise<string> {
  try {
    const response = await http.post<DeepSeekResponse>(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: DEEPSEEK_V3_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching DeepSeek V3 response:', error);
    throw error;
  }
}

export async function fetchGemini2Response(prompt: string): Promise<string> {
  try {
    const response = await http.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching Gemini 2.0 Flash response:', error);
    throw error;
  }
}

export async function fetchGemini25ProResponse(prompt: string): Promise<string> {
  try {
    const response = await http.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching Gemini 2.5 Pro response:', error);
    throw error;
  }
}

// -----------------
// xAI Grok 4
// -----------------
export async function fetchGrok4Response(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    const response = await http.post<OpenAIResponse>(
      'https://api.x.ai/v1/chat/completions',
      {
        model: GROK_4_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching Grok 4 response:', error);
    throw error;
  }
}

// Evaluation functions

export async function fetchGpt5LowEvaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const responseItem of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
      const apiResponse = await http.post<OpenAIResponsesApiResponse>(
        'https://api.openai.com/v1/responses',
        {
          model: 'gpt-5',
          input: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`,
          reasoning: { effort: 'low' },
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const content = apiResponse.data.output[0].content[0].text;
      evaluations.push(parseEvaluation(content));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with GPT-5 Low:', error);
    throw error;
  }
}

export async function fetchGpt5HighEvaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const responseItem of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
      const apiResponse = await http.post<OpenAIResponsesApiResponse>(
        'https://api.openai.com/v1/responses',
        {
          model: 'gpt-5',
          input: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`,
          reasoning: { effort: 'high' },
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const content = apiResponse.data.output[0].content[0].text;
      evaluations.push(parseEvaluation(content));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with GPT-5 High:', error);
    throw error;
  }
}

export async function fetchClaudeSonnetEvaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
        ]
      });
      
      let content = "";
      if (apiResponse.content[0].type === 'text') {
        content = apiResponse.content[0].text;
      }
      
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }
    
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Claude 3.7 Sonnet:', error);
    throw error;
  }
}

export async function fetchClaude45SonnetEvaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      const apiResponse = await anthropic.messages.create({
        model: ANTHROPIC_SONNET_45_MODEL,
        max_tokens: 1000,
        messages: [
          { role: 'user', content: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
        ]
      });
      let content = '';
      if (apiResponse.content[0].type === 'text') {
        content = apiResponse.content[0].text;
      }
      evaluations.push(parseEvaluation(content));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Claude 4.5 Sonnet:', error);
    throw error;
  }
}

export async function fetchDeepSeekR1Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await http.post<DeepSeekResponse>(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-reasoner',
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const content = apiResponse.data.choices[0].message.content;
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }
    
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with DeepSeek R1:', error);
    throw error;
  }
}

export async function fetchDeepSeekV3Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      const apiResponse = await http.post<DeepSeekResponse>(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: DEEPSEEK_V3_MODEL,
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const content = apiResponse.data.choices[0].message.content;
      evaluations.push(parseEvaluation(content));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with DeepSeek V3:', error);
    throw error;
  }
}

export async function fetchGemini2Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await http.post<GeminiResponse>(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        }
      );
      
      const content = apiResponse.data.candidates[0].content.parts[0].text;
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }
    
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Gemini 2.0 Flash:', error);
    throw error;
  }
}

export async function fetchGemini25ProEvaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await http.post<GeminiResponse>(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        }
      );
      
      const content = apiResponse.data.candidates[0].content.parts[0].text;
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }
    
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Gemini 2.5 Pro:', error);
    throw error;
  }
}

export async function fetchGrok4Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      const apiResponse = await http.post<OpenAIResponse>(
        'https://api.x.ai/v1/chat/completions',
        {
          model: GROK_4_MODEL,
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const content = apiResponse.data.choices[0].message.content;
      evaluations.push(parseEvaluation(content));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Grok 4:', error);
    throw error;
  }
}

// Helper functions
function createEvaluationPrompt(originalPrompt: string, responseLabel: string, responseText: string): string {
  return `
Original prompt: "${originalPrompt}"

Response ${responseLabel}:
${responseText}

Please evaluate this response on a scale of 1-10, where 1 is completely incorrect or unhelpful and 10 is perfect. 
Then, provide a paragraph explaining why the response is or isn't correct.

Format your answer as:
Score: [number between 1-10]
Explanation: [your paragraph explaining the evaluation]
`;
}

function parseEvaluation(evaluationText: string): { score: number, explanation: string } {
  // Simple parsing function - in a real app, this would be more robust
  const scoreMatch = evaluationText.match(/Score:\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;
  
  const explanationMatch = evaluationText.match(/Explanation:\s*([\s\S]+)/i);
  const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
  
  return { score, explanation };
} 