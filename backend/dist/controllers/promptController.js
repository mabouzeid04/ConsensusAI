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
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateResponses = exports.getModelResponses = void 0;
const aiServices_1 = require("../services/aiServices");
const historyService_1 = require("../services/historyService");
const jwt_1 = require("../utils/jwt");
// Controller functions
const MODEL_REGISTRY = {
    gpt5_low: {
        label: 'OpenAI GPT-5 Low',
        respond: aiServices_1.fetchGpt5LowResponse,
        evaluate: aiServices_1.fetchGpt5LowEvaluation,
    },
    gpt5_high: {
        label: 'OpenAI GPT-5 High',
        respond: aiServices_1.fetchGpt5HighResponse,
        evaluate: aiServices_1.fetchGpt5HighEvaluation,
    },
    claude_45_sonnet: {
        label: 'Claude 4.5 Sonnet',
        respond: aiServices_1.fetchClaude45SonnetResponse,
        evaluate: aiServices_1.fetchClaude45SonnetEvaluation,
    },
    deepseek_r1: {
        label: 'DeepSeek R1',
        respond: aiServices_1.fetchDeepSeekR1Response,
        evaluate: aiServices_1.fetchDeepSeekR1Evaluation,
    },
    deepseek_v3: {
        label: 'DeepSeek V3',
        respond: aiServices_1.fetchDeepSeekV3Response,
        evaluate: aiServices_1.fetchDeepSeekV3Evaluation,
    },
    gemini_20_flash: {
        label: 'Gemini 2.5 Flash',
        respond: aiServices_1.fetchGemini2Response,
        evaluate: aiServices_1.fetchGemini2Evaluation,
    },
    gemini_25_pro: {
        label: 'Gemini 2.5 Pro',
        respond: aiServices_1.fetchGemini25ProResponse,
        evaluate: aiServices_1.fetchGemini25ProEvaluation,
    },
    grok_4: {
        label: 'Grok 4',
        respond: aiServices_1.fetchGrok4Response,
        evaluate: aiServices_1.fetchGrok4Evaluation,
    },
};
const getModelResponses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt, generators } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        const chosen = ((generators === null || generators === void 0 ? void 0 : generators.length) ? generators : Object.keys(MODEL_REGISTRY));
        const settled = yield Promise.allSettled(chosen.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield MODEL_REGISTRY[id].respond(prompt);
            return { id, model: MODEL_REGISTRY[id].label, response };
        })));
        const modelResponses = [];
        settled.forEach((r, idx) => {
            if (r.status === 'fulfilled') {
                modelResponses.push(r.value);
            }
            else {
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
    }
    catch (error) {
        console.error('Error fetching model responses:', error);
        res.status(500).json({ error: 'Failed to fetch model responses' });
    }
});
exports.getModelResponses = getModelResponses;
const evaluateResponses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { prompt, shuffledResponses, originalMapping, judges } = req.body;
        if (!prompt || !shuffledResponses || !originalMapping) {
            return res.status(400).json({ error: 'Prompt, shuffled responses, and original mapping are required' });
        }
        // Judges default to responders (self-judging allowed)
        const respondersPresent = originalMapping.map(m => m.id).filter(Boolean);
        const chosenJudges = (judges && judges.length ? judges : respondersPresent);
        const evaluationPromises = chosenJudges.map(id => evaluateResponsesWithModelId(id, prompt, shuffledResponses));
        const allEvaluationsResults = yield Promise.allSettled(evaluationPromises);
        const evaluationsByModel = allEvaluationsResults.map((result, i) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            return shuffledResponses.map(() => ({
                score: 0,
                explanation: `Evaluation with ${MODEL_REGISTRY[chosenJudges[i]].label} failed`
            }));
        });
        // Organize evaluations by response
        const responsesWithEvaluations = shuffledResponses.map((response, index) => {
            var _a;
            // Find original model for this response
            const originalModel = ((_a = originalMapping.find((item) => item.response === response.response)) === null || _a === void 0 ? void 0 : _a.model) || 'Unknown';
            // Collect all evaluations for this response
            const evaluations = evaluationsByModel.map((modelEval, evalIndex) => {
                var _a, _b, _c, _d;
                return ({
                    model: MODEL_REGISTRY[chosenJudges[evalIndex]].label || 'Unknown',
                    score: (_b = (_a = modelEval === null || modelEval === void 0 ? void 0 : modelEval[index]) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 0,
                    explanation: (_d = (_c = modelEval === null || modelEval === void 0 ? void 0 : modelEval[index]) === null || _c === void 0 ? void 0 : _c.explanation) !== null && _d !== void 0 ? _d : 'Evaluation failed'
                });
            });
            return {
                label: response.label || '',
                model: originalModel,
                response: response.response,
                evaluations
            };
        });
        // Persist comparison
        const clientId = req.headers['x-client-id'] || '';
        // Try to read user from auth cookie if present
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.auth) || '';
        const payload = token ? (0, jwt_1.verifyAuthToken)(token) : null;
        let comparisonId = undefined;
        if (clientId) {
            try {
                const created = yield (0, historyService_1.createComparison)({
                    clientId,
                    userId: (payload === null || payload === void 0 ? void 0 : payload.userId) || null,
                    prompt,
                    generators: originalMapping.map(m => m.id).filter(Boolean),
                    judges: chosenJudges,
                    data: { prompt, responsesWithEvaluations },
                });
                comparisonId = created.id;
            }
            catch (err) {
                console.error('Failed to persist comparison:', err);
            }
        }
        res.status(200).json({
            prompt,
            responsesWithEvaluations,
            comparisonId,
        });
    }
    catch (error) {
        console.error('Error evaluating responses:', error);
        res.status(500).json({ error: 'Failed to evaluate responses' });
    }
});
exports.evaluateResponses = evaluateResponses;
// Helper functions
function shuffleAndLabelResponses(responses) {
    // Fisher-Yates shuffle algorithm
    for (let i = responses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [responses[i], responses[j]] = [responses[j], responses[i]];
    }
    // Assign labels A through E
    const labels = ['A', 'B', 'C', 'D', 'E'];
    return responses.map((response, index) => (Object.assign(Object.assign({}, response), { label: labels[index] })));
}
function evaluateResponsesWithModelId(id, prompt, responses) {
    return __awaiter(this, void 0, void 0, function* () {
        const evaluationFunction = MODEL_REGISTRY[id].evaluate;
        try {
            return yield evaluationFunction(prompt, responses);
        }
        catch (error) {
            console.error(`Error during evaluation with ${MODEL_REGISTRY[id].label}:`, error);
            return responses.map(() => ({
                score: 0,
                explanation: `Evaluation with ${MODEL_REGISTRY[id].label} failed`
            }));
        }
    });
}
