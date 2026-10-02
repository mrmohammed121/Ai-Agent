import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { chatRouter } from './server/routes/chat.js';
import { searchRouter } from './server/routes/search.js';
import { voiceRouter } from './server/routes/voice.js';
import { statusRouter } from './server/routes/status.js';

dotenv.config();

// Safe directory resolution compatible with both ESM (tsx dev) and bundled CJS (node dist/server.cjs)
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/chat', chatRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/voice', voiceRouter);
  app.use('/api/status', statusRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'M.A.R.K Core Server', timestamp: Date.now() });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[M.A.R.K] Command Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[M.A.R.K] Failed to start server:', err);
  process.exit(1);
});
