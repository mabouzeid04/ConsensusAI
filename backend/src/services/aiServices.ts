import axios from 'axios';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { OpenAI } from 'openai';
// Using HTTP API for Anthropic (Claude) per instruction

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

// Initialize Google GenAI client
const googleAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
const OPENAI_GPT5_LOW_MODEL = process.env.OPENAI_GPT5_LOW_MODEL || 'gpt-5'; 
const OPENAI_GPT5_HIGH_MODEL = process.env.OPENAI_GPT5_HIGH_MODEL || 'gpt-5';
const ANTHROPIC_SONNET_45_MODEL = process.env.ANTHROPIC_SONNET_45_MODEL || 'claude-sonnet-4-5-20250929';
const DEEPSEEK_V3_MODEL = process.env.DEEPSEEK_V3_MODEL || 'DeepSeek-V3.2-Exp';
const GROK_4_MODEL = process.env.GROK_4_MODEL || 'grok-4';

// Helper function to convert base64 data URL to URL object for OpenAI
function base64ToImageUrl(base64: string): { type: 'input_image'; url: string } {
  return { type: 'input_image', url: base64 };
}

// Helper function to convert base64 data URL to buffer and media type
function parseBase64Image(base64: string): { data: string; media_type: string } {
  // Extract media type and base64 data from data URL
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format');
  }
  return {
    media_type: matches[1],
    data: matches[2]
  };
}

// -----------------
// OpenAI (GPT-5)
// -----------------
export async function fetchGpt5LowResponse(prompt: string, image?: string): Promise<string> {
  try {
    const content: any[] = [{ type: 'input_text', text: prompt }];

    // Add image if provided
    if (image) {
      content.push(base64ToImageUrl(image));
    }

    const response = await openai.responses.create({
      model: OPENAI_GPT5_LOW_MODEL,
      input: [
        { role: 'user', content }
      ],
      max_output_tokens: 4096,
    } as any);

    const text = (response as any).output_text || '';
    return text;
  } catch (error) {
    const err: any = error as any;
    console.error('Error fetching GPT-5 Low reasoning response:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw error;
  }
}

export async function fetchGpt5HighResponse(prompt: string, image?: string): Promise<string> {
  try {
    const content: any[] = [{ type: 'input_text', text: prompt }];

    // Add image if provided
    if (image) {
      content.push(base64ToImageUrl(image));
    }

    const response = await openai.responses.create({
      model: OPENAI_GPT5_HIGH_MODEL,
      input: [
        { role: 'user', content }
      ],
      max_output_tokens: 4096,
    } as any);

    const text = (response as any).output_text || '';
    return text;
  } catch (error) {
    const err: any = error as any;
    console.error('Error fetching GPT-5 High reasoning response:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw error;
  }
}


export async function fetchClaudeSonnetResponse(prompt: string, image?: string): Promise<string> {
  try {
    let content: any;

    if (image) {
      const { media_type, data } = parseBase64Image(image);
      content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type,
            data
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ];
    } else {
      content = prompt;
    }

    const apiResponse = await http.post<AnthropicResponse>(
      'https://api.anthropic.com/v1/messages',
      {
        model: ANTHROPIC_SONNET_45_MODEL,
        max_tokens: 4096,
        messages: [
          { role: 'user', content }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    return apiResponse.data.content[0].text;
  } catch (error) {
    console.error('Error fetching Claude 3.7 Sonnet response:', error);
    throw error;
  }
}

export async function fetchClaude45SonnetResponse(prompt: string, image?: string): Promise<string> {
  try {
    let content: any;

    if (image) {
      const { media_type, data } = parseBase64Image(image);
      content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type,
            data
          }
        },
        {
          type: 'text',
          text: prompt
        }
      ];
    } else {
      content = prompt;
    }

    const apiResponse = await http.post<AnthropicResponse>(
      'https://api.anthropic.com/v1/messages',
      {
        model: ANTHROPIC_SONNET_45_MODEL,
        max_tokens: 4096,
        messages: [
          { role: 'user', content }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    return apiResponse.data.content[0].text;
  } catch (error) {
    console.error('Error fetching Claude 4.5 Sonnet response:', error);
    throw error;
  }
}

export async function fetchDeepSeekR1Response(prompt: string, image?: string): Promise<string> {
  try {
    // DeepSeek does not support vision - ignore image parameter
    const response = await http.post<any>(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-reasoner',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 32768,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const reasoning = response.data.choices[0].message.reasoning_content;
    const answer = response.data.choices[0].message.content;
    return answer;
  } catch (error) {
    console.error('Error fetching DeepSeek R1 response:', error);
    throw error;
  }
}

export async function fetchDeepSeekV3Response(prompt: string, image?: string): Promise<string> {
  try {
    // DeepSeek does not support vision - ignore image parameter
    const response = await http.post<DeepSeekResponse>(
      'https://api.deepseek.com/chat/completions',
      {
        model: DEEPSEEK_V3_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        stream: false
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

export async function fetchGemini2Response(prompt: string, image?: string): Promise<string> {
  try {
    let contents: any;

    if (image) {
      const { media_type, data } = parseBase64Image(image);
      contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: media_type,
                data
              }
            },
            { text: prompt }
          ]
        }
      ];
    } else {
      contents = prompt;
    }

    const response = await googleAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents
    });

    return response.text || '';
  } catch (error) {
    console.error('Error fetching Gemini 2.5 Flash response:', error);
    throw error;
  }
}

export async function fetchGemini25ProResponse(prompt: string, image?: string): Promise<string> {
  try {
    let contents: any;

    if (image) {
      const { media_type, data } = parseBase64Image(image);
      contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: media_type,
                data
              }
            },
            { text: prompt }
          ]
        }
      ];
    } else {
      contents = prompt;
    }

    const response = await googleAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents
    });

    return response.text || '';
  } catch (error) {
    console.error('Error fetching Gemini 2.5 Pro response:', error);
    throw error;
  }
}

// -----------------
// xAI Grok 4
// -----------------
export async function fetchGrok4Response(prompt: string, image?: string): Promise<string> {
  try {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;

    let userContent: any;
    if (image) {
      // Grok uses OpenAI-compatible format for vision
      userContent = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: image } }
      ];
    } else {
      userContent = prompt;
    }

    const response = await http.post<OpenAIResponse>(
      'https://api.x.ai/v1/chat/completions',
      {
        model: GROK_4_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        max_tokens: 4096,
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

export async function fetchGpt5LowEvaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const responseItem of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
      const content: any[] = [{ type: 'input_text', text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }];

      // Add image if provided (for context in evaluation)
      if (image) {
        content.push(base64ToImageUrl(image));
      }

      const apiResponse = await openai.responses.create({
        model: OPENAI_GPT5_LOW_MODEL,
        input: [
          { role: 'user', content }
        ],
        max_output_tokens: 4096,
      } as any);

      const text = (apiResponse as any).output_text || '';
      evaluations.push(parseEvaluation(text));
    }
    return evaluations;
  } catch (error) {
    const err: any = error as any;
    console.error('Error evaluating with GPT-5 Low:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw error;
  }
}

export async function fetchGpt5HighEvaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const responseItem of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
      const content: any[] = [{ type: 'input_text', text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }];

      // Add image if provided (for context in evaluation)
      if (image) {
        content.push(base64ToImageUrl(image));
      }

      const apiResponse = await openai.responses.create({
        model: OPENAI_GPT5_HIGH_MODEL,
        input: [
          { role: 'user', content }
        ],
        max_output_tokens: 4096,
      } as any);

      const text = (apiResponse as any).output_text || '';
      evaluations.push(parseEvaluation(text));
    }
    return evaluations;
  } catch (error) {
    const err: any = error as any;
    console.error('Error evaluating with GPT-5 High:', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw error;
  }
}

export async function fetchClaudeSonnetEvaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      let content: any;

      if (image) {
        const { media_type, data } = parseBase64Image(image);
        content = [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type,
              data
            }
          },
          {
            type: 'text',
            text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`
          }
        ];
      } else {
        content = `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`;
      }

      const apiResponse = await http.post<AnthropicResponse>(
        'https://api.anthropic.com/v1/messages',
        {
          model: ANTHROPIC_SONNET_45_MODEL,
          max_tokens: 4096,
          messages: [
            { role: 'user', content }
          ]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );
      const text = apiResponse.data.content[0].text;
      const evaluation = parseEvaluation(text);
      evaluations.push(evaluation);
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Claude 3.7 Sonnet:', error);
    throw error;
  }
}

export async function fetchClaude45SonnetEvaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      let content: any;

      if (image) {
        const { media_type, data } = parseBase64Image(image);
        content = [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type,
              data
            }
          },
          {
            type: 'text',
            text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`
          }
        ];
      } else {
        content = `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`;
      }

      const apiResponse = await http.post<AnthropicResponse>(
        'https://api.anthropic.com/v1/messages',
        {
          model: ANTHROPIC_SONNET_45_MODEL,
          max_tokens: 4096,
          messages: [
            { role: 'user', content }
          ]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );
      const text = apiResponse.data.content[0].text;
      evaluations.push(parseEvaluation(text));
    }
    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Claude 4.5 Sonnet:', error);
    throw error;
  }
}

export async function fetchDeepSeekR1Evaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    // DeepSeek does not support vision - ignore image parameter
    const evaluations = [];

    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);

      const apiResponse = await http.post<any>(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-reasoner',
          messages: [
            { role: 'user', content: evaluationPrompt }
          ],
          max_tokens: 32768,
          stream: false
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

export async function fetchDeepSeekV3Evaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    // DeepSeek does not support vision - ignore image parameter
    const evaluations: Array<{ score: number, explanation: string }> = [];
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      const apiResponse = await http.post<DeepSeekResponse>(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: evaluationPrompt }
          ],
          temperature: 0.3,
          stream: false
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

export async function fetchGemini2Evaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];

    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      let contents: any;

      if (image) {
        const { media_type, data } = parseBase64Image(image);
        contents = [
          {
            parts: [
              {
                inlineData: {
                  mimeType: media_type,
                  data
                }
              },
              { text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
            ]
          }
        ];
      } else {
        contents = `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`;
      }

      const apiResponse = await googleAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
      });

      const content = apiResponse.text || '';
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }

    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Gemini 2.5 Flash:', error);
    throw error;
  }
}

export async function fetchGemini25ProEvaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations = [];

    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
      let contents: any;

      if (image) {
        const { media_type, data } = parseBase64Image(image);
        contents = [
          {
            parts: [
              {
                inlineData: {
                  mimeType: media_type,
                  data
                }
              },
              { text: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
            ]
          }
        ];
      } else {
        contents = `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`;
      }

      const apiResponse = await googleAI.models.generateContent({
        model: 'gemini-2.5-pro',
        contents
      });

      const content = apiResponse.text || '';
      const evaluation = parseEvaluation(content);
      evaluations.push(evaluation);
    }

    return evaluations;
  } catch (error) {
    console.error('Error evaluating with Gemini 2.5 Pro:', error);
    throw error;
  }
}

export async function fetchGrok4Evaluation(prompt: string, responses: ModelResponse[], image?: string): Promise<Array<{ score: number, explanation: string }>> {
  try {
    const evaluations: Array<{ score: number, explanation: string }> = [];
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    for (const response of responses) {
      const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);

      let userContent: any;
      if (image) {
        // Grok uses OpenAI-compatible format for vision
        userContent = [
          { type: 'text', text: evaluationPrompt },
          { type: 'image_url', image_url: { url: image } }
        ];
      } else {
        userContent = evaluationPrompt;
      }

      const apiResponse = await http.post<OpenAIResponse>(
        'https://api.x.ai/v1/chat/completions',
        {
          model: GROK_4_MODEL,
          messages: [
            { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
            { role: 'user', content: userContent }
          ],
          temperature: 0.3,
          max_tokens: 4096,
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