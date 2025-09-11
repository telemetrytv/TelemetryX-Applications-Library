#!/usr/bin/env node

import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins in development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static files - the harness UI is in the same directory as this server
app.use(express.static(__dirname));

// Discover applications
function discoverApplications() {
  const appsDir = path.join(__dirname, '..', 'applications');
  const apps = [];
  
  try {
    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(appsDir, entry.name);
        const packageJsonPath = path.join(appPath, 'package.json');
        const distPath = path.join(appPath, 'dist');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const hasDistFolder = fs.existsSync(distPath);
          
          apps.push({
            id: entry.name,
            name: packageJson.telemetryx?.displayName || packageJson.name || entry.name,
            description: packageJson.description || 'No description',
            version: packageJson.version || '0.0.0',
            category: packageJson.telemetryx?.category || 'uncategorized',
            hasDistFolder,
            distPath: hasDistFolder ? `/apps/${entry.name}` : null
          });
        }
      }
    }
  } catch (error) {
    console.error('Error discovering applications:', error);
  }
  
  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

// API endpoint to get available applications
app.get('/api/applications', (req, res) => {
  const apps = discoverApplications();
  res.json(apps);
});

// API endpoint to build a specific application
app.post('/api/build/:appId', express.json(), async (req, res) => {
  const { appId } = req.params;
  const appPath = path.join(__dirname, '..', 'applications', appId);
  
  if (!fs.existsSync(appPath)) {
    return res.status(404).json({ error: 'Application not found' });
  }
  
  try {
    console.log(`Building application: ${appId}`);
    
    // Check if the app has a build script
    const packageJsonPath = path.join(appPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // First, install dependencies if node_modules doesn't exist or package-lock.json is newer
    const nodeModulesPath = path.join(appPath, 'node_modules');
    const packageLockPath = path.join(appPath, 'package-lock.json');
    const pnpmLockPath = path.join(appPath, 'pnpm-lock.yaml');
    
    // Check if we need to install dependencies
    const needsInstall = !fs.existsSync(nodeModulesPath) || 
      (fs.existsSync(packageLockPath) && fs.statSync(packageLockPath).mtime > fs.statSync(nodeModulesPath).mtime) ||
      (fs.existsSync(pnpmLockPath) && fs.statSync(pnpmLockPath).mtime > fs.statSync(nodeModulesPath).mtime);
    
    if (needsInstall) {
      console.log(`Installing dependencies for ${appId}...`);
      
      // Detect package manager (prefer pnpm if lock file exists)
      const packageManager = fs.existsSync(pnpmLockPath) ? 'pnpm' : 'npm';
      
      execSync(`${packageManager} install`, {
        cwd: appPath,
        stdio: 'inherit'
      });
    }
    
    // Now build the application
    if (packageJson.scripts?.build) {
      const packageManager = fs.existsSync(pnpmLockPath) ? 'pnpm' : 'npm';
      execSync(`${packageManager} run build`, {
        cwd: appPath,
        stdio: 'inherit'
      });
    } else {
      // If no build script, just ensure dist folder exists
      const distPath = path.join(appPath, 'dist');
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
      }
    }
    
    res.json({ success: true, message: `Application ${appId} built successfully` });
  } catch (error) {
    console.error(`Error building application ${appId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Serve application dist folders
app.use('/apps/:appId', (req, res, next) => {
  const appId = req.params.appId;
  const distPath = path.join(__dirname, '..', 'applications', appId, 'dist');
  
  if (fs.existsSync(distPath)) {
    express.static(distPath)(req, res, next);
  } else {
    res.status(404).send(`Application '${appId}' dist folder not found. Please build the application first.`);
  }
});

// WebSocket server for hot reload
const wss = new WebSocketServer({ port: 3001 });

// Watch for file changes
const watcher = chokidar.watch([
  path.join(__dirname, '..', 'applications/*/dist/**'),
  path.join(__dirname, '**')
], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`File changed: ${filePath}`);
  
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

// Serve the main harness page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   TelemetryX Applications Development Server              ║
║                                                           ║
║   Server:     http://localhost:${PORT}                       ║
║   WebSocket:  ws://localhost:3001                         ║
║                                                           ║
║   Available applications:                                 ║`);
  
  const apps = discoverApplications();
  apps.forEach(app => {
    const status = app.hasDistFolder ? '✓' : '✗';
    console.log(`║   ${status} ${app.name.padEnd(20)} ${app.hasDistFolder ? '(ready)' : '(needs build)'}`.padEnd(60) + '║');
  });
  
  console.log(`║                                                           ║
║   Commands:                                               ║
║   - Press Ctrl+C to stop the server                       ║
║   - Run 'npm run build' to build all applications         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down development server...');
  watcher.close();
  wss.close();
  server.close();
  process.exit(0);
});

// Export for testing
export { server, wss, watcher };