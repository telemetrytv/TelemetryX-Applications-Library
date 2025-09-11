# TelemetryX Development Harness - Technical Documentation

## Overview

The TelemetryX Development Harness is a sophisticated browser-based development environment that simulates the TelemetryX platform for local application development. It provides a complete mock SDK environment, hot reload capabilities, and dual-iframe layout for simultaneous render and settings view development.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser (localhost:3000)                  │
├─────────────────────────────────────────────────────────────┤
│                         Header Bar                          │
│  [Logo] [App Selector ▼] [Reload] [Build] [Status: Ready]  │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│    Render Frame (75%)        │   Settings Frame (25%)      │
│  ┌────────────────────────┐  │  ┌────────────────────────┐ │
│  │                        │  │  │                        │ │
│  │   Application Iframe   │  │  │   Settings Iframe     │ │
│  │    (16:9 aspect)       │  │  │   (Full height)       │ │
│  │                        │  │  │                        │ │
│  └────────────────────────┘  │  └────────────────────────┘ │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### Server Architecture

```
dev-server.js (Express Server - Port 3000)
    │
    ├── Static File Serving
    │   └── dev-harness/ (HTML, JS, CSS)
    │
    ├── Application Discovery
    │   └── applications/**/package.json scan
    │
    ├── API Endpoints
    │   ├── GET  /api/applications
    │   ├── POST /api/build/:appId
    │   └── GET  /apps/:appId/* (dist serving)
    │
    └── WebSocket Server (Port 3001)
        └── File Watch & Hot Reload
```

## Data Flow

### SDK Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application (Iframe)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              @telemetryx/sdk                        │   │
│  │                                                     │   │
│  │  telemetryx.device.getInfo() ───┐                 │   │
│  │  telemetryx.data.fetch()    ────┼──┐              │   │
│  │  telemetryx.storage.set()   ────┼──┼──┐           │   │
│  │                                  │  │  │           │   │
│  └───────────────────────────────────┼──┼──┼───────────┘   │
│                                      │  │  │               │
└──────────────────────────────────────┼──┼──┼───────────────┘
                                       │  │  │
                    PostMessage API    ↓  ↓  ↓
                   ════════════════════════════════
                                       │  │  │
┌──────────────────────────────────────┼──┼──┼───────────────┐
│                 Development Harness  │  │  │               │
│                                      ↓  ↓  ↓               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         telemetryx-harness.js (Mock SDK)           │   │
│  │                                                     │   │
│  │  handleIframeMessage() {                           │   │
│  │    switch(type) {                                  │   │
│  │      'telemetryx.device.getInfo': → mockData      │   │
│  │      'telemetryx.data.get': → mockData            │   │
│  │      'telemetryx.storage.set': → localStorage     │   │
│  │    }                                               │   │
│  │  }                                                 │   │
│  │                                                     │   │
│  │  Mock Data Store:                                  │   │
│  │  ┌──────────────────────────────────────────┐     │   │
│  │  │ • Device Info (location, display, etc)   │     │   │
│  │  │ • Weather Data (current, forecast)       │     │   │
│  │  │ • Calendar Events                        │     │   │
│  │  │ • RSS Feeds                              │     │   │
│  │  │ • Social Media Posts                     │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Hot Reload System

### WebSocket Communication

```
File System Changes
        │
        ↓
┌──────────────────┐
│   Chokidar       │
│   File Watcher   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  WebSocket       │
│  Server (:3001)  │
└────────┬─────────┘
         │
    Broadcast
         │
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
Client 1   Client 2  Client 3  ...
(Reload)   (Reload)  (Reload)
```

### Watched Paths
- `applications/*/dist/**` - Built application files
- `dev-harness/**` - Harness interface files

### Reload Behavior
1. File change detected by Chokidar
2. WebSocket message sent to all connected clients
3. Client receives message with changed file path
4. If current app is affected, iframe reloads automatically
5. SDK connection re-established post-reload

## Application Discovery

### Directory Structure Requirements

```
applications/
├── weather/
│   ├── package.json     # Required: Contains app metadata
│   ├── dist/            # Required for running (built output)
│   │   ├── index.html   # Render mount point
│   │   └── settings.html # Settings mount point
│   └── src/             # Source code (not served)
├── rss/
│   └── ...
└── [other-apps]/
```

### Package.json Metadata

```json
{
  "name": "telemetryx-weather-app",
  "version": "1.0.0",
  "description": "Weather display application",
  "telemetryx": {
    "displayName": "Weather",
    "category": "Information",
    "mountPoints": {
      "render": { "path": "/index.html" },
      "settings": { "path": "/settings.html" }
    }
  }
}
```

## Iframe Configuration

### Render Iframe (Left Panel - 75% width)
- **Purpose**: Main application display
- **Aspect Ratio**: 16:9 (1920x1080 simulation)
- **Sandbox**: `allow-scripts allow-same-origin allow-forms allow-popups allow-modals`
- **URL Pattern**: `/apps/{appId}/index.html`

### Settings Iframe (Right Panel - 25% width)
- **Purpose**: Application configuration interface
- **Height**: Full container height
- **Sandbox**: Same as render iframe
- **URL Pattern**: `/apps/{appId}/settings.html`

## Mock SDK Features

### Available Mock Data

#### Device Information
```javascript
{
  id: 'dev-device-001',
  name: 'Development Device',
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    timezone: 'America/Los_Angeles'
  },
  display: {
    width: 1920,
    height: 1080,
    pixelRatio: 1
  },
  capabilities: ['network', 'location', 'audio', 'video'],
  version: '1.0.0-dev'
}
```

#### Weather Data
- Current conditions (temperature, humidity, wind, etc.)
- 3-day forecast
- Weather alerts
- Location-based data for San Francisco

#### Calendar Events
- Sample meetings and appointments
- Time-based events with descriptions
- Timezone-aware scheduling

#### RSS Feeds
- Mock news feed data
- Sample articles with metadata
- Publication timestamps

#### Social Media
- Sample posts from various platforms
- Engagement metrics (likes, shares)
- Author information

### SDK API Methods

The mock SDK implements these TelemetryX SDK methods:

| Method | Description | Mock Behavior |
|--------|-------------|---------------|
| `telemetryx.ready()` | Signal app is ready | Establishes connection |
| `telemetryx.device.getInfo()` | Get device information | Returns mock device data |
| `telemetryx.data.get(key)` | Fetch data by key | Returns mock data for key |
| `telemetryx.data.set(key, value)` | Store data | Saves to memory map |
| `telemetryx.data.subscribe(key, callback)` | Subscribe to data changes | Sets up mock subscription |
| `telemetryx.storage.get(key)` | Get from storage | Uses localStorage |
| `telemetryx.storage.set(key, value)` | Save to storage | Uses localStorage |
| `telemetryx.config.get()` | Get app configuration | Returns mock config |

## Build System Integration

### Build Process

```
User clicks "Build" button
            │
            ↓
    POST /api/build/:appId
            │
            ↓
    Check package.json
            │
    ┌───────┴────────┐
    │                │
Has build script?    No build script?
    │                │
    ↓                ↓
npm run build    Create dist/ folder
    │                │
    └────────┬───────┘
            ↓
    Return success/error
            │
            ↓
    Refresh app list
            │
            ↓
    Auto-load built app
```

### Build Requirements
- Applications must have `package.json`
- Build script defined in `scripts.build` (optional)
- Output must go to `dist/` directory
- Must include `index.html` for render view
- Should include `settings.html` for settings (optional)

## Development Workflow

### Starting the Harness

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on:
# - HTTP: http://localhost:3000
# - WebSocket: ws://localhost:3001
```

### Application Development Flow

1. **Create Application**
   ```bash
   cd applications/
   mkdir my-app
   cd my-app
   npm init
   ```

2. **Develop with Hot Reload**
   - Start harness: `npm run dev`
   - Build app: Click "Build" or run `npm run build` in app directory
   - Select app from dropdown
   - Changes in `dist/` trigger automatic reload

3. **Testing SDK Integration**
   - Mock SDK automatically injected
   - Use browser DevTools to inspect messages
   - Check console for SDK communication logs

## User Interface Components

### Header Bar
- **Logo**: TelemetryX branding
- **App Selector**: Dropdown with available applications
- **Reload Button**: Manual refresh of current app
- **Build Button**: Trigger application build
- **Status Indicator**: Connection and operation status

### Status States
- **Ready** (Green): Connected and operational
- **Loading** (Yellow): Operation in progress
- **Error** (Red): Connection or operation failed
- **Disconnected** (Red): WebSocket connection lost

## Error Handling

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| App not appearing | Missing package.json | Add valid package.json to app directory |
| "Needs build" status | No dist folder | Click Build button or run npm run build |
| Settings not loading | No settings.html | Settings are optional; ignore warning |
| WebSocket disconnected | Server stopped | Restart dev server |
| Iframe not loading | Build failed | Check build logs, fix errors |

## Security Considerations

### Iframe Sandboxing
- Scripts allowed for app functionality
- Same-origin policy enforced
- Forms and popups permitted
- Modal dialogs supported

### Message Validation
- Origin checking for localhost only
- Message structure validation
- Error boundaries for message processing
- Sanitized error responses

## Performance Optimization

### Resource Loading
- Lazy loading of application iframes
- On-demand application building
- Cached mock data responses
- Efficient WebSocket message broadcasting

### Memory Management
- Iframe cleanup on app switch
- Message queue pruning
- Subscription cleanup on disconnect
- Mock data stored in memory maps

## Debugging

### Console Logging

The harness provides detailed console output:

```
🔗 TelemetryX harness connected to render iframe
📨 Received message from iframe: {type: 'telemetryx.ready', ...}
✅ Iframe application is ready
📤 Sending response: {id: '123', data: {...}}
```

### DevTools Integration
1. Open Chrome DevTools (F12)
2. Check Network tab for iframe loading
3. Use Console for SDK communication logs
4. Inspect Application > Frames for iframe context
5. Check Application > Local Storage for mock storage

## Extension Points

### Adding Mock Data

Edit `telemetryx-harness.js`:

```javascript
initializeMockData() {
  // Add new mock data category
  this.mockData.set('custom-data', {
    field1: 'value1',
    field2: 'value2'
  });
}
```

### Custom Message Handlers

```javascript
processMessage(message) {
  switch (type) {
    case 'custom.action':
      this.handleCustomAction(payload, id);
      break;
  }
}
```

## Best Practices

### Application Development
1. Always test in harness before deployment
2. Use mock data to simulate edge cases
3. Test both render and settings views
4. Verify hot reload works correctly
5. Check console for SDK errors

### Performance Testing
1. Monitor iframe memory usage
2. Test with large mock datasets
3. Verify cleanup on app switching
4. Check for memory leaks in subscriptions
5. Test rapid reload scenarios

### SDK Integration
1. Always wait for ready signal
2. Handle connection failures gracefully
3. Implement proper error boundaries
4. Clean up subscriptions on unmount
5. Use appropriate data keys

## Troubleshooting

### Application Not Loading
```bash
# Check if dist folder exists
ls applications/my-app/dist/

# Verify index.html is present
cat applications/my-app/dist/index.html

# Check build output
cd applications/my-app && npm run build
```

### WebSocket Connection Issues
```bash
# Check if port 3001 is available
lsof -i :3001

# Verify WebSocket server is running
# Look for "WebSocket: ws://localhost:3001" in server output
```

### Mock Data Not Working
```javascript
// In browser console, check harness instance
window.telemetryxHarness.mockData

// Verify message handling
window.addEventListener('message', (e) => console.log('Message:', e.data));
```

## Summary

The TelemetryX Development Harness provides a complete local development environment that accurately simulates the production TelemetryX platform. With hot reload, mock SDK, dual-view layout, and comprehensive debugging tools, it enables rapid application development and testing without requiring access to actual TelemetryX hardware or cloud services.