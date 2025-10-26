import express from 'express';
import { getModelResponses, evaluateResponses } from '../controllers/promptController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.post('/submit', requireAuth, getModelResponses);
router.post('/evaluate', requireAuth, evaluateResponses);

export { router as promptRouter }; 