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

// Shared axios instance with timeouts
const http = axios.create({
  timeout: 30000,
});

export async function fetchGpt4O1Response(prompt: string): Promise<string> {
  try {
    const response = await http.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching OpenAI o1 response:', error);
    throw error;
  }
}

export async function fetchGpt4O3Response(prompt: string): Promise<string> {
  try {
    const response = await http.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 1.0,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching OpenAI o3-mini response:', error);
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

// Evaluation functions
export async function fetchGpt4O1Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await http.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
    console.error('Error evaluating with GPT-4:', error);
    throw error;
  }
}

// Similar implementations for other evaluation functions
export async function fetchGpt4O3Evaluation(prompt: string, responses: ModelResponse[]): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];
    
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      
      const apiResponse = await http.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
    console.error('Error evaluating with OpenAI o3-mini:', error);
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