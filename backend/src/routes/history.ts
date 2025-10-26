import express from 'express';
import { listComparisons, getComparison, attachGuestHistoryToUser } from '../services/historyService';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (!clientId) {
      return res.status(400).json({ error: 'Missing x-client-id header' });
    }
    const items = await listComparisons(clientId, (req.user as any)?.userId);
    res.json(items);
  } catch (err) {
    console.error('Error listing history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (!clientId) {
      return res.status(400).json({ error: 'Missing x-client-id header' });
    }
    const { id } = req.params;
    const item = await getComparison(id, clientId, (req.user as any)?.userId);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching history item:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

export { router as historyRouter };
