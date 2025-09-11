import { jest } from '@jest/globals';
import supertest from 'supertest';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Development Server', () => {
  let server;
  let wss;
  let watcher;
  let request;
  
  beforeAll(async () => {
    // Dynamically import the server
    const serverModule = await import('../dev-harness/server.js');
    server = serverModule.server;
    wss = serverModule.wss;
    watcher = serverModule.watcher;
    request = supertest(server);
  });
  
  afterAll((done) => {
    // Clean up all resources
    if (watcher) watcher.close();
    if (wss) wss.close();
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });
  
  describe('GET /', () => {
    it('should serve the main harness HTML', async () => {
      const response = await request.get('/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('TelemetryX Applications Development Harness');
    });
  });
  
  describe('GET /api/applications', () => {
    it('should return list of applications', async () => {
      const response = await request.get('/api/applications');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should have hello-world application
      const helloWorld = response.body.find(app => app.id === 'hello-world');
      expect(helloWorld).toBeDefined();
      expect(helloWorld.name).toBe('telemetryx-hello-world-app');
    });
  });
  
  describe('GET /apps/:appId/:file', () => {
    it('should serve application files from dist directory', async () => {
      // First, check if hello-world has dist files
      const distPath = join(__dirname, '../applications/hello-world/dist');
      let hasDistFiles = false;
      try {
        await fs.access(distPath);
        const files = await fs.readdir(distPath);
        hasDistFiles = files.includes('index.html');
      } catch {
        // dist doesn't exist
      }
      
      if (hasDistFiles) {
        const response = await request.get('/apps/hello-world/index.html');
        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      } else {
        // If no dist files, expect 404
        const response = await request.get('/apps/hello-world/index.html');
        expect(response.status).toBe(404);
      }
    });
    
    it('should return 404 for non-existent application', async () => {
      const response = await request.get('/apps/non-existent/index.html');
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/build/:appId', () => {
    it('should return 404 for non-existent application', async () => {
      const response = await request.post('/api/build/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Application not found');
    });
    
    // Note: Actual build test would take too long and modify files
    // In a real test environment, you'd mock the exec function
  });
  
  describe('Static file serving', () => {
    it('should serve bridge-stub.js', async () => {
      const response = await request.get('/bridge-stub.js');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/javascript');
    });
  });
});