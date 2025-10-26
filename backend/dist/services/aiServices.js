"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGpt5LowResponse = fetchGpt5LowResponse;
exports.fetchGpt5HighResponse = fetchGpt5HighResponse;
exports.fetchClaudeSonnetResponse = fetchClaudeSonnetResponse;
exports.fetchClaude45SonnetResponse = fetchClaude45SonnetResponse;
exports.fetchDeepSeekR1Response = fetchDeepSeekR1Response;
exports.fetchDeepSeekV3Response = fetchDeepSeekV3Response;
exports.fetchGemini2Response = fetchGemini2Response;
exports.fetchGemini25ProResponse = fetchGemini25ProResponse;
exports.fetchGrok4Response = fetchGrok4Response;
exports.fetchGpt5LowEvaluation = fetchGpt5LowEvaluation;
exports.fetchGpt5HighEvaluation = fetchGpt5HighEvaluation;
exports.fetchClaudeSonnetEvaluation = fetchClaudeSonnetEvaluation;
exports.fetchClaude45SonnetEvaluation = fetchClaude45SonnetEvaluation;
exports.fetchDeepSeekR1Evaluation = fetchDeepSeekR1Evaluation;
exports.fetchDeepSeekV3Evaluation = fetchDeepSeekV3Evaluation;
exports.fetchGemini2Evaluation = fetchGemini2Evaluation;
exports.fetchGemini25ProEvaluation = fetchGemini25ProEvaluation;
exports.fetchGrok4Evaluation = fetchGrok4Evaluation;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Shared axios instance with timeouts
const http = axios_1.default.create({
    timeout: 60000,
});
// Model IDs with sensible defaults, overridable via env
const OPENAI_GPT5_LOW_MODEL = process.env.OPENAI_GPT5_LOW_MODEL || 'gpt-5-mini';
const OPENAI_GPT5_HIGH_MODEL = process.env.OPENAI_GPT5_HIGH_MODEL || 'gpt-5';
const ANTHROPIC_SONNET_45_MODEL = process.env.ANTHROPIC_SONNET_45_MODEL || 'claude-sonnet-4-5-20250929';
const DEEPSEEK_V3_MODEL = process.env.DEEPSEEK_V3_MODEL || 'deepseek-v3';
const GROK_4_MODEL = process.env.GROK_4_MODEL || 'grok-4';
// -----------------
// OpenAI (GPT-5)
// -----------------
function fetchGpt5LowResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post('https://api.openai.com/v1/responses', {
                model: 'gpt-5',
                input: prompt,
                reasoning: { effort: 'low' },
                temperature: 0.7,
                max_output_tokens: 4096,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.output[0].content[0].text;
        }
        catch (error) {
            console.error('Error fetching GPT-5 Low reasoning response:', error);
            throw error;
        }
    });
}
function fetchGpt5HighResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post('https://api.openai.com/v1/responses', {
                model: 'gpt-5',
                input: prompt,
                reasoning: { effort: 'high' },
                temperature: 0.7,
                max_output_tokens: 4096,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.output[0].content[0].text;
        }
        catch (error) {
            console.error('Error fetching GPT-5 High reasoning response:', error);
            throw error;
        }
    });
}
function fetchClaudeSonnetResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiResponse = yield http.post('https://api.anthropic.com/v1/messages', {
                model: ANTHROPIC_SONNET_45_MODEL,
                max_tokens: 4096,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            });
            return apiResponse.data.content[0].text;
        }
        catch (error) {
            console.error('Error fetching Claude 3.7 Sonnet response:', error);
            throw error;
        }
    });
}
function fetchClaude45SonnetResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiResponse = yield http.post('https://api.anthropic.com/v1/messages', {
                model: ANTHROPIC_SONNET_45_MODEL,
                max_tokens: 4096,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
            });
            return apiResponse.data.content[0].text;
        }
        catch (error) {
            console.error('Error fetching Claude 4.5 Sonnet response:', error);
            throw error;
        }
    });
}
function fetchDeepSeekR1Response(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post('https://api.deepseek.com/chat/completions', {
                model: 'deepseek-reasoner',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 32768,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const reasoning = response.data.choices[0].message.reasoning_content;
            const answer = response.data.choices[0].message.content;
            return answer;
        }
        catch (error) {
            console.error('Error fetching DeepSeek R1 response:', error);
            throw error;
        }
    });
}
function fetchDeepSeekV3Response(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post('https://api.deepseek.com/chat/completions', {
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error fetching DeepSeek V3 response:', error);
            throw error;
        }
    });
}
function fetchGemini2Response(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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
            });
            return response.data.candidates[0].content.parts[0].text;
        }
        catch (error) {
            console.error('Error fetching Gemini 2.0 Flash response:', error);
            throw error;
        }
    });
}
function fetchGemini25ProResponse(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield http.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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
            });
            return response.data.candidates[0].content.parts[0].text;
        }
        catch (error) {
            console.error('Error fetching Gemini 2.5 Pro response:', error);
            throw error;
        }
    });
}
// -----------------
// xAI Grok 4
// -----------------
function fetchGrok4Response(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
            const response = yield http.post('https://api.x.ai/v1/chat/completions', {
                model: GROK_4_MODEL,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('Error fetching Grok 4 response:', error);
            throw error;
        }
    });
}
// Evaluation functions
function fetchGpt5LowEvaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const responseItem of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
                const apiResponse = yield http.post('https://api.openai.com/v1/responses', {
                    model: 'gpt-5',
                    input: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`,
                    reasoning: { effort: 'low' },
                    temperature: 0.3,
                    max_output_tokens: 4096,
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
                const content = apiResponse.data.output[0].content[0].text;
                evaluations.push(parseEvaluation(content));
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with GPT-5 Low:', error);
            throw error;
        }
    });
}
function fetchGpt5HighEvaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const responseItem of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, responseItem.label || '', responseItem.response);
                const apiResponse = yield http.post('https://api.openai.com/v1/responses', {
                    model: 'gpt-5',
                    input: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}`,
                    reasoning: { effort: 'high' },
                    temperature: 0.3,
                    max_output_tokens: 4096,
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });
                const content = apiResponse.data.output[0].content[0].text;
                evaluations.push(parseEvaluation(content));
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with GPT-5 High:', error);
            throw error;
        }
    });
}
function fetchClaudeSonnetEvaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post('https://api.anthropic.com/v1/messages', {
                    model: ANTHROPIC_SONNET_45_MODEL,
                    max_tokens: 4096,
                    messages: [
                        { role: 'user', content: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
                    ]
                }, {
                    headers: {
                        'x-api-key': process.env.ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    }
                });
                const content = apiResponse.data.content[0].text;
                const evaluation = parseEvaluation(content);
                evaluations.push(evaluation);
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with Claude 3.7 Sonnet:', error);
            throw error;
        }
    });
}
function fetchClaude45SonnetEvaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post('https://api.anthropic.com/v1/messages', {
                    model: ANTHROPIC_SONNET_45_MODEL,
                    max_tokens: 4096,
                    messages: [
                        { role: 'user', content: `You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.\n\n${evaluationPrompt}` }
                    ]
                }, {
                    headers: {
                        'x-api-key': process.env.ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    }
                });
                const content = apiResponse.data.content[0].text;
                evaluations.push(parseEvaluation(content));
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with Claude 4.5 Sonnet:', error);
            throw error;
        }
    });
}
function fetchDeepSeekR1Evaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post('https://api.deepseek.com/chat/completions', {
                    model: 'deepseek-reasoner',
                    messages: [
                        { role: 'user', content: evaluationPrompt }
                    ],
                    max_tokens: 32768,
                    stream: false
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const content = apiResponse.data.choices[0].message.content;
                const evaluation = parseEvaluation(content);
                evaluations.push(evaluation);
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with DeepSeek R1:', error);
            throw error;
        }
    });
}
function fetchDeepSeekV3Evaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post('https://api.deepseek.com/chat/completions', {
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
                        { role: 'user', content: evaluationPrompt }
                    ],
                    temperature: 0.3,
                    stream: false
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const content = apiResponse.data.choices[0].message.content;
                evaluations.push(parseEvaluation(content));
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with DeepSeek V3:', error);
            throw error;
        }
    });
}
function fetchGemini2Evaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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
                });
                const content = apiResponse.data.candidates[0].content.parts[0].text;
                const evaluation = parseEvaluation(content);
                evaluations.push(evaluation);
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with Gemini 2.0 Flash:', error);
            throw error;
        }
    });
}
function fetchGemini25ProEvaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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
                });
                const content = apiResponse.data.candidates[0].content.parts[0].text;
                const evaluation = parseEvaluation(content);
                evaluations.push(evaluation);
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with Gemini 2.5 Pro:', error);
            throw error;
        }
    });
}
function fetchGrok4Evaluation(prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evaluations = [];
            const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
            for (const response of responses) {
                const evaluationPrompt = createEvaluationPrompt(prompt, response.label || '', response.response);
                const apiResponse = yield http.post('https://api.x.ai/v1/chat/completions', {
                    model: GROK_4_MODEL,
                    messages: [
                        { role: 'system', content: 'You are evaluating AI responses to a prompt. Rate each response on a scale of 1-10 and explain your reasoning.' },
                        { role: 'user', content: evaluationPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 4096,
                }, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                const content = apiResponse.data.choices[0].message.content;
                evaluations.push(parseEvaluation(content));
            }
            return evaluations;
        }
        catch (error) {
            console.error('Error evaluating with Grok 4:', error);
            throw error;
        }
    });
}
// Helper functions
function createEvaluationPrompt(originalPrompt, responseLabel, responseText) {
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
function parseEvaluation(evaluationText) {
    // Simple parsing function - in a real app, this would be more robust
    const scoreMatch = evaluationText.match(/Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;
    const explanationMatch = evaluationText.match(/Explanation:\s*([\s\S]+)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
    return { score, explanation };
}
