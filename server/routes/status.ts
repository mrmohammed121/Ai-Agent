import { Router } from 'express';
import os from 'os';
import { getOpenAISubsystemStatus } from '../services/openai.js';

export const statusRouter = Router();

statusRouter.get('/', (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const openaiInfo = getOpenAISubsystemStatus();

  res.json({
    status: 'ONLINE',
    systemName: 'J.A.R.V.I.S. MARK-85 TACTICAL OS',
    uptime: process.uptime(),
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Quantum Arc Processor',
    memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
    apiStatus: {
      openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
      openaiStatus: openaiInfo.status,
      openaiMessage: openaiInfo.message,
      searchapi: Boolean(process.env.SEARCHAPI_API_KEY && process.env.SEARCHAPI_API_KEY.trim() !== ''),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim() !== ''),
      gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
    },
    voiceConfig: {
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9',
    },
  });
});
