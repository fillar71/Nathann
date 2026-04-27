import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { app } from './src/server/app';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In development, Vite handles the frontend via its own dev server 
// but we can serve static files if needed
if (process.env.NODE_ENV !== 'production') {
  app.use('*', serveStatic({ root: './' }));
} else {
  const distPath = path.join(__dirname, 'dist');
  app.use('*', serveStatic({ root: './dist' }));
}

const port = 3000;
serve({
  fetch: app.fetch,
  port
});

console.log(`Hono server running on http://localhost:${port}`);

export default app;
