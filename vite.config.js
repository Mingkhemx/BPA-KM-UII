import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './server/apiHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function neonApiPlugin() {
  return {
    name: 'neon-api-plugin',
    configureServer(server) {
      // 1. Static serving untuk folder /images/* langsung dari direktori images/
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/images/')) {
          const rawUrl = req.url.split('?')[0];
          const cleanPath = path.join(__dirname, decodeURIComponent(rawUrl));
          if (fs.existsSync(cleanPath) && fs.statSync(cleanPath).isFile()) {
            const ext = path.extname(cleanPath).toLowerCase();
            const mimeTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return fs.createReadStream(cleanPath).pipe(res);
          }
        }
        next();
      });

      // 2. API Endpoint /api/*
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const handled = await handleApiRequest(req, res);
            if (!handled) next();
          } catch (err) {
            console.error('Neon API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), neonApiPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
