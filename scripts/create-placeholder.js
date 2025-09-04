#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Template for placeholder HTML
function createPlaceholderHTML(appName, description, icon) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} - TelemetryX Application</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 2rem;
    }
    
    .container {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .description {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .status {
      background: rgba(255, 255, 255, 0.2);
      padding: 1rem;
      border-radius: 10px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .info {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.875rem;
      opacity: 0.7;
    }
    
    .telemetryx-badge {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 0, 0, 0.5);
      padding: 0.75rem 1.25rem;
      border-radius: 30px;
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
    }
    
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .description { font-size: 1rem; }
      .container { padding: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${appName}</h1>
    <p class="description">${description}</p>
    <div class="status">
      <div class="status-indicator"></div>
      <span>Application Ready</span>
    </div>
    <div class="info">
      <p>This is a placeholder for the ${appName} application.</p>
      <p>The production build will replace this content.</p>
    </div>
  </div>
  
  <div class="telemetryx-badge">
    Powered by TelemetryX
  </div>
  
  <script>
    // Simulate TelemetryX SDK
    window.TelemetryX = {
      ready: true,
      device: {
        getInfo: () => ({
          id: 'dev-device',
          model: 'Development',
          location: { lat: 40.7128, lon: -74.0060 }
        })
      },
      data: {
        fetch: (source) => Promise.resolve({ source, data: 'mock' }),
        subscribe: (topic, callback) => {
          console.log('Subscribed to:', topic);
          return () => console.log('Unsubscribed from:', topic);
        }
      },
      telemetry: {
        logError: (error) => console.error('TelemetryX Error:', error)
      }
    };
    
    console.log('${appName} placeholder loaded');
    console.log('TelemetryX SDK (mock) available:', window.TelemetryX);
  </script>
</body>
</html>`;
}

// Application metadata
const applications = [
  { id: 'weather', name: 'Weather', description: 'Real-time weather information with forecasts and alerts', icon: '☀️' },
  { id: 'youtube', name: 'YouTube Player', description: 'Video playback with playlist management', icon: '▶️' },
  { id: 'rss', name: 'RSS Feed', description: 'News and content aggregator from RSS sources', icon: '📰' },
  { id: 'slack', name: 'Slack Integration', description: 'Team communication dashboard and notifications', icon: '💬' },
  { id: 'clock', name: 'World Clock', description: 'Multi-timezone clock display with custom styles', icon: '🕐' },
  { id: 'news', name: 'News Aggregator', description: 'Multi-source news with category filtering', icon: '📱' },
  { id: 'dashboard', name: 'Dashboard', description: 'KPI metrics and data visualization', icon: '📊' },
  { id: 'calendar', name: 'Calendar', description: 'Event display with calendar integrations', icon: '📅' },
  { id: 'social-media', name: 'Social Media', description: 'Social feed aggregator for multiple platforms', icon: '🌐' },
  { id: 'analytics', name: 'Analytics', description: 'Business intelligence and data analytics', icon: '📈' }
];

// Create placeholder files
applications.forEach(app => {
  const distPath = path.join(__dirname, '..', 'applications', app.id, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Create placeholder HTML
  const html = createPlaceholderHTML(app.name, app.description, app.icon);
  fs.writeFileSync(indexPath, html);
  
  console.log(`✓ Created placeholder for ${app.name} at ${indexPath}`);
});

console.log(`\n✅ Created ${applications.length} placeholder files`);