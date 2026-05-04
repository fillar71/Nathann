import { serve, getRequestListener } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { app } from './src/server/app';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Inject Vite middleware
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    const honoListener = getRequestListener(app.fetch);

    const devServer = createServer((req, res) => {
      // Pass API requests to Hono explicitly
      if (req.url && req.url.startsWith('/api')) {
        honoListener(req, res);
      } else {
        // Pass other requests to Vite Dev Server
        viteServer.middlewares(req, res, () => {
          res.statusCode = 404;
          res.end('Not Found');
        });
      }
    });

    devServer.listen(port, '0.0.0.0', () => {
      console.log(`Development server running on http://localhost:${port}`);
    });
  } else {
    // Production mode: Hono manages both API and static files
    app.use('*', serveStatic({ root: './dist' }));
    
    // Add fallback for SPA routing
    app.get('*', async (c) => {
       const html = await import('fs').then(m => m.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8'));
       return c.html(html);
    });

    serve({
      fetch: app.fetch,
      port
    });
    console.log(`Production server running on http://localhost:${port}`);
  }
}

startServer();
