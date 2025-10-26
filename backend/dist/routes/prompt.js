"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptRouter = void 0;
const express_1 = __importDefault(require("express"));
const promptController_1 = require("../controllers/promptController");
const router = express_1.default.Router();
exports.promptRouter = router;
router.post('/submit', promptController_1.getModelResponses);
router.post('/evaluate', promptController_1.evaluateResponses);
