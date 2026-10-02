import { Router } from 'express';
import { synthesizeSpeech } from '../services/elevenlabs.js';

export const voiceRouter = Router();

voiceRouter.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body as { text?: string; voiceId?: string };

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text parameter is required for voice synthesis' });
      return;
    }

    const ttsResult = await synthesizeSpeech(text, voiceId);

    if (ttsResult.success && ttsResult.audioBuffer) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', ttsResult.audioBuffer.length);
      res.send(ttsResult.audioBuffer);
      return;
    }

    // Return fallback status so frontend can use Web Speech API immediately
    res.json({
      fallback: true,
      message: ttsResult.message || 'ElevenLabs unavailable, client Web Speech fallback enabled',
    });
  } catch (error) {
    console.error('[Route /api/voice] Error:', error);
    res.status(500).json({
      error: 'Voice synthesis error',
      fallback: true,
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
