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
exports.createComparison = createComparison;
exports.listComparisons = listComparisons;
exports.getComparison = getComparison;
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
function createComparison(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { clientId, prompt, generators = [], judges = [], data } = params;
        const created = yield prisma.comparison.create({
            data: {
                clientId,
                prompt,
                generators: generators,
                judges: judges,
                data: data,
            },
            select: { id: true },
        });
        return created;
    });
}
function listComparisons(clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield prisma.comparison.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                prompt: true,
                createdAt: true,
                data: true,
            },
        });
        return rows.map((row) => {
            const data = row.data;
            const items = Array.isArray(data === null || data === void 0 ? void 0 : data.responsesWithEvaluations) ? data.responsesWithEvaluations : [];
            const numResponses = items.length;
            const bestAverage = items.reduce((best, item) => {
                const scores = Array.isArray(item === null || item === void 0 ? void 0 : item.evaluations) ? item.evaluations : [];
                const avg = scores.length
                    ? scores.reduce((acc, e) => acc + ((e === null || e === void 0 ? void 0 : e.score) || 0), 0) / scores.length
                    : 0;
                return Math.max(best, avg);
            }, 0);
            return {
                id: row.id,
                prompt: row.prompt,
                createdAt: row.createdAt,
                summary: { numResponses, bestAverage },
            };
        });
    });
}
function getComparison(id, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield prisma.comparison.findFirst({
            where: { id, clientId },
            select: { id: true, prompt: true, data: true, createdAt: true },
        });
        if (!row)
            return null;
        return Object.assign({ id: row.id, prompt: row.prompt, createdAt: row.createdAt }, row.data);
    });
}
