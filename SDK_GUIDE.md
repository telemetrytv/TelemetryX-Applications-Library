# TelemetryX SDK Guide for LLMs

This guide provides comprehensive information about the TelemetryX SDK (@telemetryx/sdk), designed to help LLMs understand and effectively use the SDK to build applications for the TelemetryX platform.

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [SDK Architecture](#sdk-architecture)
3. [Application Structure](#application-structure)
4. [Core APIs](#core-apis)
5. [Storage System](#storage-system)
6. [Configuration](#configuration)
7. [Development Patterns](#development-patterns)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)
10. [Common Examples](#common-examples)

## Platform Overview

TelemetryX is a next-generation low-code platform for digital screens that transforms traditional digital signage into interactive application platforms. Instead of just displaying static content, TelemetryX runs full web applications (React/JS) on screens connected to devices like TVs, touch screen kiosks, and digital displays.

### Key Platform Concepts

- **Devices**: Physical hardware (TVs, kiosks, displays) connected to the TelemetryX platform
- **Applications**: Web applications built with standard web technologies (HTML, CSS, JavaScript/TypeScript)
- **Freeform Editor**: Default visual composition tool for creating layouts with applications, media, and text
- **Playlists**: Sequences of content pages with timing and transitions
- **Mount Points**: Different contexts where applications can run (settings, render, workers, etc.)
- **Offline Support**: Applications work automatically offline with caching and synchronization

### Platform Philosophy

- **Web Technologies**: Built on familiar technologies (JavaScript, HTML, CSS, React)
- **No Proprietary Languages**: Leverages existing web development skills and ecosystem
- **Hardware Integration**: Provides APIs for device-specific features while maintaining web standards
- **Scalable Management**: Manage thousands of devices per account
- **Low-Code**: Visual composition tools combined with custom application development

## SDK Architecture

The TelemetryX SDK is built with a message-passing architecture using the browser's `postMessage` API for communication between applications and the platform.

### Core Components

1. **Client**: Central communication hub managing message passing
2. **Bridge**: Enables host applications to communicate with embedded applications
3. **Resource APIs**: Domain-specific APIs (store, media, applications, etc.)
4. **Message Validation**: Zod schemas for runtime message validation
5. **Event System**: Subscription-based real-time updates

### Communication Flow

```
Application (SDK) ←→ postMessage API ←→ TelemetryX Platform
```

- Applications run in iframes for security and isolation
- All communication uses structured message passing
- Request-response pattern with 30-second timeouts
- Subscription model for real-time data updates

### Installation

```bash
npm install @telemetryx/sdk
```

Or include directly in HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@telemetryx/sdk"></script>
```

## Application Structure

TelemetryX applications are web applications that run within the Freeform Editor, a visual composition tool that allows users to create layouts by positioning applications alongside media, text, and other visual elements.

### Mount Points

Applications define mount points in their `telemetry.config.json` file:

- **`settings`**: Configuration UI that appears in the TelemetryX user administration interface at app.telemetryx.ai when your application is selected. .
- **`render`**: The actual content that displays on devices and in the Freeform Editor's canvas. This is what end users see.
- **`background`**: Optional worker script that runs continuously in the background, even when your application is not currently visible in the playlist rotation.

### Application Context

- **Embedded within Freeform Editor**: Your application runs as an iframe within TelemetryX's visual layout system
- **Positioning**: Can be positioned, resized, and scheduled as part of content playlists
- **Playlist Integration**: Can control playlist navigation and timing
- **Content Overrides**: Can trigger emergency alerts or priority content
- **Device Display**: Shows on physical devices like digital signage, kiosks, and displays

### Lifecycle

- **On Devices**: Start when playlist containing the app loads, run while page is active
- **In Admin UI**: Start when Freeform Editor loads playlist containing the app for editing
- **Background Workers**: Run continuously once playlist is loaded, even when app not visible

## Core APIs

### Configuration

Every application must initialize the SDK:

```javascript
import { configure } from '@telemetryx/sdk';

// Must match name in telemetry.config.json
configure('my-application-name');
```

### High-Level Resource APIs

Most developers should use these resource-specific APIs:

```javascript
// Storage
await store().local.set('key', 'value');

// Media content
const folders = await media().getFoldersByTag('marketing');

// Application discovery
const url = await applications().getUrl('weather-app', 'render');

// Account information
const account = await accounts().getCurrent();

// User information
const userResult = await users().getCurrent();

// Playlist control (Freeform Editor integration)
await playlist().nextPage();

// Content overrides (emergency alerts)
await overrides().setOverride('emergency-alert');
```

### Available SDK Functions

The SDK exports these functions for application use:

- **`configure(applicationName)`**: Initialize the SDK with your application name
- **`destroy()`**: Clean up SDK resources and event listeners
- **`on(name, handler)`**: Register event handler for specific message type
- **`once(name, handler)`**: Register one-time event handler
- **`off(name, handler)`**: Remove event handler
- **`send(name, data)`**: Send one-way message to platform
- **`request(name, data)`**: Send request and wait for response (30s timeout)
- **`subscribe(name, key, handler)`**: Set up persistent subscription
- **`unsubscribe(name, key, handler)`**: Cancel subscription
- **`store()`**: Access storage API with multiple scopes
- **`applications()`**: Discover and embed other applications
- **`media()`**: Access platform media content
- **`accounts()`**: Get account information
- **`users()`**: Get user information
- **`playlist()`**: Control Freeform Editor playlist navigation
- **`overrides()`**: Manage content overrides and emergency alerts

## Storage System

The storage system provides four scopes for different persistence needs:

### Global Scope
- **Access**: All instances of the same application (by name)
- **Persistence**: Synced across all devices in account
- **Use Case**: App-wide settings, branding, global configuration

```javascript
// Settings shared across all instances of this app
await store().global.set('companyBranding', {
  logo: 'https://example.com/logo.png',
  primaryColor: '#007bff'
});
```

### Local Scope  
- **Access**: Specific application instance (by applicationId)
- **Persistence**: Synced across devices for this instance
- **Use Case**: Instance configuration, settings ↔ render communication

```javascript
// Settings specific to this app instance
await store().local.set('displayCity', 'New York');

// Subscribe for real-time updates between mount points
store().local.subscribe('displayCity', (city) => {
  updateWeatherDisplay(city);
});
```

### DeviceLocal Scope
- **Access**: Specific application instance (by applicationId)  
- **Persistence**: Device only, never synced, survives restarts
- **Use Case**: Device-specific caching, kiosk interactions, calibration

```javascript
// Data that stays on this device only
await store().deviceLocal.set('touchCalibration', {
  xOffset: 10,
  yOffset: 5
});
```

### Shared Scope
- **Access**: Any application with namespace knowledge
- **Persistence**: Synced across all devices in account
- **Use Case**: Inter-application communication

```javascript
// Coordinated data sharing between applications
await store().shared.set('weather-data', 'temperature', '72°F');
await store().shared.set('weather-data', 'humidity', '45%');
```

### Storage Best Practices

1. **Use subscriptions for real-time updates** - Essential for responsive applications
2. **Choose appropriate scope** - Impacts data visibility and performance
3. **Clean up subscriptions** - Prevent memory leaks
4. **Handle offline scenarios** - Storage works offline automatically
5. **DeviceLocal limitations** - Cannot be used in settings mount points (admin UI doesn't run on devices)

## Configuration

Every TelemetryX application requires a `telemetry.config.json` file:

```json
{
  "name": "weather-application",
  "version": "1.2.0",
  "displayName": "Weather Widget",
  "description": "Displays current weather conditions",
  
  "mountPoints": {
    "render": {
      "path": "/render"
    },
    "settings": {
      "path": "/settings"
    }
  },
  
  "workers": [
    {
      "script": "./workers/sync-weather.js"
    }
  ],
  
  "containers": [
    {
      "name": "weather-api",
      "image": "weather-service:v1.0",
      "port": 3000
    }
  ]
}
```

### Configuration Fields

- **name**: Unique identifier, must match `configure()` call
- **version**: Semantic version for the application
- **displayName**: Human-readable name shown in admin UI
- **description**: Brief description of application functionality
- **mountPoints**: URL paths for different application contexts
- **workers**: Background scripts for continuous processing
- **containers**: Docker containers for backend services

## Development Patterns

### Settings ↔ Render Communication

The most common pattern involves configuration UI communicating with display content:

```javascript
// settings.js (settings mount point)
import { configure, store } from '@telemetryx/sdk';

configure('weather-app');

document.getElementById('cityForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('cityInput').value;
  
  // Save to local scope - specific to this app instance
  await store().local.set('selectedCity', city);
  
  showSuccess('City updated successfully');
});

// Load current value on settings page
store().local.get('selectedCity').then(city => {
  if (city) {
    document.getElementById('cityInput').value = city;
  }
});
```

```javascript
// render.js (render mount point)
import { configure, store } from '@telemetryx/sdk';

configure('weather-app');

// Subscribe to settings changes for real-time updates
store().local.subscribe('selectedCity', (city) => {
  if (city) {
    fetchAndDisplayWeather(city);
  } else {
    showConfigurationPrompt();
  }
});

// Initial load
store().local.get('selectedCity').then(city => {
  if (city) {
    fetchAndDisplayWeather(city);
  }
});

async function fetchAndDisplayWeather(city) {
  try {
    const weatherData = await fetch(`https://api.weather.com/v1/current?q=${city}`);
    const weather = await weatherData.json();
    
    document.getElementById('temperature').textContent = weather.temperature;
    document.getElementById('condition').textContent = weather.condition;
  } catch (error) {
    console.error('Weather fetch failed:', error);
    showErrorMessage('Unable to load weather data');
  }
}
```


### Background Workers

Workers run continuously, even when applications aren't visible:

```javascript
// worker.js (referenced in telemetry.config.json)
import { configure, store } from '@telemetryx/sdk';

configure('weather-app');

async function syncWeatherData() {
  try {
    // Get all configured cities from different app instances
    const cities = await getCitiesFromInstances();
    
    for (const city of cities) {
      const weatherData = await fetchWeatherData(city);
      
      // Store in shared scope for all apps to access
      await store().shared.set('weather-cache', city, {
        data: weatherData,
        lastUpdated: new Date().toISOString()
      });
    }
    
    console.log(`Updated weather for ${cities.length} cities`);
  } catch (error) {
    console.error('Weather sync failed:', error);
  }
  
  // Schedule next update in 10 minutes
  setTimeout(syncWeatherData, 10 * 60 * 1000);
}

// Start the sync process
syncWeatherData();
```

## Advanced Features

### Standard SDK Extensions (@telemetryx/sdk only)

#### Playlist Control

Control the Freeform Editor's playlist navigation:

```javascript
import { playlist } from '@telemetryx/sdk';

// Navigate playlist pages
await playlist().nextPage();
await playlist().previousPage();

// Modify current page duration (in seconds)
await playlist().setDuration(45);
```

#### Content Overrides

Trigger emergency alerts or priority content:

```javascript
import { overrides } from '@telemetryx/sdk';

// Set emergency override
await overrides().setOverride('fire-evacuation-alert');

// Clear override when emergency is over
await overrides().clearOverride('fire-evacuation-alert');
```

### Media Content Access

Access platform-hosted media:

```javascript
import { media } from '@telemetryx/sdk';

async function displayMarketingContent() {
  try {
    // Get folders tagged with 'marketing'
    const folders = await media().getFoldersByTag('marketing');
    
    for (const folder of folders) {
      // Get content from folder
      const content = await media().getMediaContentByFolderId(folder.id);
      
      for (const item of content) {
        // Get full media item with public URLs
        const mediaItem = await media().getMediaContentById(item.id);
        
        // Use the public URL to display media
        if (mediaItem.publicUrls.length > 0) {
          displayMediaItem(mediaItem.publicUrls[0], mediaItem.name);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load media:', error);
    showPlaceholderContent();
  }
}
```

## Best Practices

### 1. SDK Initialization

```javascript
// ✅ Good: Initialize early
import { configure } from '@telemetryx/sdk';

configure('weather-app'); // Must match telemetry.config.json

// ❌ Bad: Using SDK before configure
// store().local.set('key', 'value'); // Will throw error
```

### 2. Error Handling

```javascript
// ✅ Good: Comprehensive error handling
try {
  const result = await media().getFoldersByTag('marketing');
  displayContent(result);
} catch (error) {
  // Handle specific timeout errors
  if (error.message.includes('timed out')) {
    showTimeoutMessage('Loading took too long, please try again');
  } else {
    console.error('Media loading failed:', error);
    showGenericError('Unable to load content');
  }
  
  // Always provide fallback
  displayCachedContent();
}
```

### 3. Storage Scope Selection

```javascript
// ✅ Good: Appropriate scope usage
await store().global.set('companyLogo', logoUrl);        // All instances
await store().local.set('widgetConfig', config);        // This instance
await store().deviceLocal.set('calibration', settings); // This device
await store().shared.set('alerts', 'emergency', alert); // Cross-app

// ❌ Bad: Wrong scope choice
await store().deviceLocal.set('companyLogo', url);      // Won't sync to other devices
await store().global.set('userPreferences', prefs);    // Shared across all instances
```

### 4. Real-Time Updates

```javascript
// ✅ Good: Use subscriptions for real-time updates
store().local.subscribe('temperature', (temp) => {
  updateTemperatureDisplay(temp);
});

// ❌ Bad: Polling for changes
setInterval(async () => {
  const temp = await store().local.get('temperature');
  updateTemperatureDisplay(temp);
}, 1000); // Inefficient and delayed
```

### 5. Resource Cleanup

```javascript
// ✅ Good: Clean up subscriptions
let temperatureHandler = (temp) => updateDisplay(temp);

await store().local.subscribe('temperature', temperatureHandler);

// Later, when component unmounts
await store().local.unsubscribe('temperature', temperatureHandler);

// ❌ Bad: Memory leaks from abandoned subscriptions
// (No cleanup leads to memory leaks)
```

### 6. Responsive Design

```javascript
// ✅ Good: Adapt to different screen sizes
function initializeApp() {
  const screenWidth = window.innerWidth;
  
  if (screenWidth < 768) {
    loadMobileLayout();
  } else if (screenWidth < 1200) {
    loadTabletLayout();
  } else {
    loadDesktopLayout();
  }
  
  // Handle orientation changes
  window.addEventListener('resize', handleResize);
}
```

## Development Workflow

The typical development workflow for TelemetryX applications:

### 1. Local Development
- Create your web application using standard web technologies
- Implement settings and render mount points
- Test functionality locally using development tools

### 2. Configuration
- Create `telemetry.config.json` with application metadata and mount points
- Define any background workers or containers if needed
- Ensure application name matches between config and `configure()` call

### 3. Deployment
- Package your application (HTML, CSS, JS, assets, config)
- Upload to TelemetryX platform via admin interface
- Platform builds and caches your application automatically

### 4. Content Creation
- Open Freeform Editor in TelemetryX admin interface
- Create playlist pages with visual layouts
- Add your application to pages alongside media, text, and other elements
- Position and resize your application within the layout
- Configure application settings through the settings mount point

### 5. Device Assignment
- Assign completed playlists to target devices
- Applications deploy automatically to assigned devices
- Monitor application performance and logs

### 6. Updates and Iteration
- Make changes to your application code
- Re-upload to platform (versioning supported)
- Changes propagate automatically to devices running the application

## Common Examples

### Complete Weather Application

#### telemetry.config.json
```json
{
  "name": "weather-widget",
  "version": "1.0.0",
  "displayName": "Weather Display",
  "description": "Shows current weather conditions for a selected city",
  "mountPoints": {
    "render": { "path": "/render.html" },
    "settings": { "path": "/settings.html" }
  }
}
```

#### settings.html & settings.js
```html
<!DOCTYPE html>
<html>
<head>
  <title>Weather Settings</title>
  <style>
    .form-group { margin: 20px 0; }
    input[type="text"] { 
      width: 100%; 
      padding: 8px; 
      font-size: 16px;
    }
    button { 
      background: #007bff; 
      color: white; 
      padding: 10px 20px; 
      border: none; 
      cursor: pointer;
    }
    .success { color: green; }
  </style>
</head>
<body>
  <h2>Weather Configuration</h2>
  <form id="cityForm">
    <div class="form-group">
      <label for="cityInput">City:</label>
      <input type="text" id="cityInput" placeholder="Enter city name" required>
    </div>
    <button type="submit">Save</button>
  </form>
  <div id="status"></div>
  
  <script type="module" src="./settings.js"></script>
</body>
</html>
```

```javascript
// settings.js
import { configure, store } from '@telemetryx/sdk';

configure('weather-widget');

const form = document.getElementById('cityForm');
const input = document.getElementById('cityInput');
const status = document.getElementById('status');

// Load current city when settings opens
store().local.get('city').then(city => {
  if (city) {
    input.value = city;
  }
});

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const city = input.value.trim();
  if (!city) return;
  
  try {
    await store().local.set('city', city);
    status.innerHTML = '<span class="success">City saved successfully!</span>';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      status.innerHTML = '';
    }, 3000);
  } catch (error) {
    status.innerHTML = `<span class="error">Failed to save: ${error.message}</span>`;
  }
});
```

#### render.html & render.js
```html
<!DOCTYPE html>
<html>
<head>
  <title>Weather Display</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 40px;
      background: linear-gradient(135deg, #74b9ff, #0984e3);
      color: white;
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .weather-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      max-width: 400px;
      margin: 0 auto;
    }
    .temperature {
      font-size: 4em;
      font-weight: bold;
      margin: 20px 0;
    }
    .condition {
      font-size: 1.5em;
      margin: 10px 0;
    }
    .city {
      font-size: 2em;
      margin-bottom: 20px;
    }
    .configure-message {
      text-align: center;
      font-size: 1.2em;
      color: #666;
    }
    .error {
      color: #ff6b6b;
    }
  </style>
</head>
<body>
  <div id="weather-display">
    <div class="configure-message">Configuring weather display...</div>
  </div>
  
  <script type="module" src="./render.js"></script>
</body>
</html>
```

```javascript
// render.js
import { configure, store } from '@telemetryx/sdk';

configure('weather-widget');

const weatherDisplay = document.getElementById('weather-display');

// Subscribe to city changes for real-time updates
store().local.subscribe('city', (city) => {
  if (city) {
    loadWeatherForCity(city);
  } else {
    showConfigurationMessage();
  }
});

// Initial load
store().local.get('city').then(city => {
  if (city) {
    loadWeatherForCity(city);
  } else {
    showConfigurationMessage();
  }
});

async function loadWeatherForCity(city) {
  try {
    showLoadingMessage(city);
    
    // Simulated weather API call
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`);
    
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    
    const weatherData = await response.json();
    displayWeather(city, weatherData);
    
  } catch (error) {
    console.error('Weather loading failed:', error);
    showErrorMessage(city, error.message);
  }
}

function displayWeather(city, data) {
  const temperature = Math.round(data.main.temp);
  const condition = data.weather[0].description;
  const icon = data.weather[0].icon;
  
  weatherDisplay.innerHTML = `
    <div class="weather-card">
      <div class="city">${city}</div>
      <div class="temperature">${temperature}°C</div>
      <div class="condition">${condition}</div>
    </div>
  `;
}

function showConfigurationMessage() {
  weatherDisplay.innerHTML = `
    <div class="configure-message">
      Please configure a city in the application settings.
    </div>
  `;
}

function showLoadingMessage(city) {
  weatherDisplay.innerHTML = `
    <div class="configure-message">
      Loading weather for ${city}...
    </div>
  `;
}

function showErrorMessage(city, error) {
  weatherDisplay.innerHTML = `
    <div class="weather-card">
      <div class="city">${city}</div>
      <div class="error">
        Unable to load weather data<br>
        <small>${error}</small>
      </div>
    </div>
  `;
}
```

