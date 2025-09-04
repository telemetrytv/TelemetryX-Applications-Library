#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appsDir = join(__dirname, '..', 'applications');

console.log('🔨 Building all TelemetryX applications independently...\n');

// Get all application directories
const apps = readdirSync(appsDir).filter(file => {
  const filePath = join(appsDir, file);
  return statSync(filePath).isDirectory();
});

let successCount = 0;
let failedApps = [];

for (const app of apps) {
  const appPath = join(appsDir, app);
  const packageJsonPath = join(appPath, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping ${app} - no package.json found`);
    continue;
  }
  
  console.log(`\n📦 Building ${app}...`);
  console.log(`   Path: ${appPath}`);
  
  try {
    // Install dependencies if needed
    if (!existsSync(join(appPath, 'node_modules'))) {
      console.log(`   Installing dependencies...`);
      execSync('npm install', {
        cwd: appPath,
        stdio: 'inherit'
      });
    }
    
    // Run build command
    console.log(`   Running build...`);
    execSync('npm run build', {
      cwd: appPath,
      stdio: 'inherit'
    });
    
    console.log(`✅ ${app} built successfully`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to build ${app}: ${error.message}`);
    failedApps.push(app);
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 Build Summary:');
console.log(`   ✅ Successfully built: ${successCount} applications`);

if (failedApps.length > 0) {
  console.log(`   ❌ Failed: ${failedApps.length} applications`);
  console.log(`      ${failedApps.join(', ')}`);
  process.exit(1);
} else {
  console.log('\n🎉 All applications built successfully!');
  console.log('\nEach application has been built independently in its own dist/ folder.');
  console.log('Run "npm run dev" to start the development harness.');
}