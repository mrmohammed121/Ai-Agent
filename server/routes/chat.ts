import { Router } from 'express';
import { processMarkConversation, ChatMessageParam } from '../services/openai.js';

export const chatRouter = Router();

chatRouter.post('/', async (req, res) => {
  try {
    const { prompt, history, forceSearch } = req.body as {
      prompt?: string;
      history?: ChatMessageParam[];
      forceSearch?: boolean;
    };

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await processMarkConversation(prompt, history || [], forceSearch);
    res.json(result);
  } catch (error) {
    console.error('[Route /api/chat] Error:', error);
    res.status(500).json({
      error: 'Failed to process conversation with M.A.R.K',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
