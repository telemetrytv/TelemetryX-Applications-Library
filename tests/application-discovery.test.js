import { jest } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Application Discovery', () => {
  const applicationsPath = join(__dirname, '../applications');
  
  describe('Applications Directory Structure', () => {
    it('should have applications directory', async () => {
      const exists = await fs.access(applicationsPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
    
    it('should have hello-world application', async () => {
      const helloWorldPath = join(applicationsPath, 'hello-world');
      const exists = await fs.access(helloWorldPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });
  
  describe('Hello World Application', () => {
    const helloWorldPath = join(applicationsPath, 'hello-world');
    
    it('should have package.json', async () => {
      const packageJsonPath = join(helloWorldPath, 'package.json');
      const exists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      expect(packageJson.name).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['@telemetryx/sdk']).toBeDefined();
    });
    
    it('should have telemetry.config.json', async () => {
      const configPath = join(helloWorldPath, 'telemetry.config.json');
      const exists = await fs.access(configPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      expect(config.name).toBe('hello-world');
      expect(config.mountPoints).toBeDefined();
      expect(config.mountPoints.render).toBeDefined();
      expect(config.mountPoints.settings).toBeDefined();
    });
    
    it('should have required HTML entry points', async () => {
      const indexHtmlPath = join(helloWorldPath, 'index.html');
      const settingsHtmlPath = join(helloWorldPath, 'settings.html');
      
      const indexExists = await fs.access(indexHtmlPath).then(() => true).catch(() => false);
      const settingsExists = await fs.access(settingsHtmlPath).then(() => true).catch(() => false);
      
      expect(indexExists).toBe(true);
      expect(settingsExists).toBe(true);
    });
    
    it('should have TypeScript configuration', async () => {
      const tsconfigPath = join(helloWorldPath, 'tsconfig.json');
      const exists = await fs.access(tsconfigPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
    
    it('should have Vite configuration', async () => {
      const viteConfigPath = join(helloWorldPath, 'vite.config.ts');
      const exists = await fs.access(viteConfigPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
    
    it('should have source files', async () => {
      const srcPath = join(helloWorldPath, 'src');
      const exists = await fs.access(srcPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
      
      const files = await fs.readdir(srcPath);
      expect(files).toContain('App.tsx');
      expect(files).toContain('main.tsx');
      expect(files).toContain('settings.tsx');
      expect(files).toContain('settings-main.tsx');
      expect(files).toContain('types.ts');
    });
    
    it('should have documentation', async () => {
      const readmePath = join(helloWorldPath, 'README.md');
      const claudePath = join(helloWorldPath, 'CLAUDE.md');
      
      const readmeExists = await fs.access(readmePath).then(() => true).catch(() => false);
      const claudeExists = await fs.access(claudePath).then(() => true).catch(() => false);
      
      expect(readmeExists).toBe(true);
      expect(claudeExists).toBe(true);
    });
  });
  
  describe('Application Discovery Function', () => {
    async function discoverApplications() {
      const apps = [];
      const entries = await fs.readdir(applicationsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const appPath = join(applicationsPath, entry.name);
        const packageJsonPath = join(appPath, 'package.json');
        
        try {
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
          const configPath = join(appPath, 'telemetry.config.json');
          let config = {};
          
          try {
            config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
          } catch {
            // telemetry.config.json is optional
          }
          
          apps.push({
            id: entry.name,
            name: entry.name,
            displayName: config.displayName || packageJson.telemetryx?.displayName || entry.name,
            version: packageJson.version,
            description: config.description || packageJson.description,
            mountPoints: config.mountPoints || packageJson.telemetryx?.mountPoints,
            path: appPath
          });
        } catch (error) {
          // Skip directories without package.json
        }
      }
      
      return apps;
    }
    
    it('should discover hello-world application', async () => {
      const apps = await discoverApplications();
      expect(apps.length).toBeGreaterThan(0);
      
      const helloWorld = apps.find(app => app.id === 'hello-world');
      expect(helloWorld).toBeDefined();
      expect(helloWorld.name).toBe('hello-world');
      expect(helloWorld.mountPoints).toBeDefined();
    });
    
    it('should return valid application metadata', async () => {
      const apps = await discoverApplications();
      
      for (const app of apps) {
        expect(app.id).toBeDefined();
        expect(app.name).toBeDefined();
        expect(app.version).toBeDefined();
        expect(app.path).toBeDefined();
      }
    });
  });
});