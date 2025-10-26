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
exports.historyRouter = void 0;
const express_1 = __importDefault(require("express"));
const historyService_1 = require("../services/historyService");
const router = express_1.default.Router();
exports.historyRouter = router;
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientId = req.headers['x-client-id'] || '';
        if (!clientId) {
            return res.status(400).json({ error: 'Missing x-client-id header' });
        }
        const items = yield (0, historyService_1.listComparisons)(clientId);
        res.json(items);
    }
    catch (err) {
        console.error('Error listing history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clientId = req.headers['x-client-id'] || '';
        if (!clientId) {
            return res.status(400).json({ error: 'Missing x-client-id header' });
        }
        const { id } = req.params;
        const item = yield (0, historyService_1.getComparison)(id, clientId);
        if (!item)
            return res.status(404).json({ error: 'Not found' });
        res.json(item);
    }
    catch (err) {
        console.error('Error fetching history item:', err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
}));
