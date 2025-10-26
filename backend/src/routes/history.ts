import express from 'express';
import { listComparisons, getComparison } from '../services/historyService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (!clientId) {
      return res.status(400).json({ error: 'Missing x-client-id header' });
    }
    const items = await listComparisons(clientId);
    res.json(items);
  } catch (err) {
    console.error('Error listing history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const clientId = (req.headers['x-client-id'] as string) || '';
    if (!clientId) {
      return res.status(400).json({ error: 'Missing x-client-id header' });
    }
    const { id } = req.params;
    const item = await getComparison(id, clientId);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching history item:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

export { router as historyRouter };
