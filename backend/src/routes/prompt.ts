import express from 'express';
import { getModelResponses, evaluateResponses } from '../controllers/promptController';

const router = express.Router();

router.post('/submit', getModelResponses);
router.post('/evaluate', evaluateResponses);

export { router as promptRouter }; 