#!/usr/bin/env node

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import type { ViteDevServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

async function createServer() {
  let vite: ViteDevServer | null = null;

  // Enable CORS for all origins first (before Vite middleware)
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Serve application dist folders (before Vite to avoid conflicts)
  app.use('/apps/:appId', (req, res, next) => {
    const appId = req.params.appId;
    const distPath = path.join(__dirname, '..', 'applications', appId, 'dist');
    
    if (fs.existsSync(distPath)) {
      express.static(distPath)(req, res, next);
    } else {
      res.status(404).send(`Application '${appId}' dist folder not found. Please build the application first.`);
    }
  });

  if (isDev) {
    // Create Vite server in middleware mode for development
    vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 3002  // Use a different port for Vite HMR to avoid conflicts
        }
      },
      appType: 'spa',
      // Configure Vite to only watch its own files
      configFile: path.join(__dirname, 'vite.config.ts'),
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Fallback route for SPA in production
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // WebSocket server for hot reload of application files
  const wss = new WebSocketServer({ port: 3001 });

  // Only watch application dist folders, exclude node_modules and our own files
  const watchPaths = path.join(__dirname, '..', 'applications', '*', 'dist');
  
  // Only create watcher if we have something to watch
  let watcher: ReturnType<typeof chokidar.watch> | null = null;
  if (fs.existsSync(path.join(__dirname, '..', 'applications'))) {
    watcher = chokidar.watch(watchPaths, {
      ignored: [
        /(^|[\/\\])\../,  // ignore dotfiles
        /node_modules/,    // ignore node_modules
        /dev-harness/,     // ignore our own directory
      ],
      persistent: true,
      ignoreInitial: true,  // Don't fire events for initial scan
      awaitWriteFinish: {   // Wait for write to finish to avoid multiple events
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    watcher.on('change', (filePath: string) => {
      console.log(`Application file changed: ${filePath}`);
      
      // Notify all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'reload',
            path: filePath
          }));
        }
      });
    });
  }

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   TelemetryX Applications Development Server              ║
║                                                           ║
║   Server:     http://localhost:${PORT}                       ║
║   WebSocket:  ws://localhost:3001 (app reload)            ║
${isDev ? '║   Vite HMR:   ws://localhost:3002 (harness HMR)          ║\n' : ''}║   Mode:       ${isDev ? 'Development' : 'Production'}                              ║
║                                                           ║
║   Enter application URLs in the harness to preview        ║
║   Examples:                                               ║
║   - http://localhost:5173 (local dev server)              ║
║   - /apps/hello-world (built application)                 ║
║                                                           ║
║   Press Ctrl+C to stop the server                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  });

  // Handle server shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down development server...');
    if (watcher) {
      await watcher.close();
    }
    wss.close();
    server.close();
    if (vite) {
      await vite.close();
    }
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
  });

  return { server, wss, watcher };
}

// Start the server
createServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});