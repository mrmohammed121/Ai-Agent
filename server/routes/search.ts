import { Router } from 'express';
import { executeSearch } from '../services/searchapi.js';

export const searchRouter = Router();

searchRouter.post('/', async (req, res) => {
  try {
    const { query } = req.body as { query?: string };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const result = await executeSearch(query);
    res.json(result);
  } catch (error) {
    console.error('[Route /api/search] Error:', error);
    res.status(500).json({
      error: 'Failed to execute web search',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
