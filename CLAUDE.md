# TelemetryX Applications Library - AI Assistant Guide

## Repository Overview

This is the **TelemetryX Applications Library** - a collection of **completely independent** applications for the TelemetryX platform. Each application is standalone with its own dependencies, build system, and documentation.

## Key Context

### What is TelemetryX?
TelemetryX is a low-code platform for digital screens that enables full-fledged applications using familiar web technologies. Applications run on commercial kiosk and digital signage displays that operate 24/7 in public spaces.

### Repository Purpose
This library provides a collection of ready-to-deploy applications for the TelemetryX platform. Each application is:
- Completely independent with its own build system
- Built using the `@telemetryx/sdk` package
- Optimized for 24/7 operation on digital displays
- Designed for viewing from a distance

## Repository Structure

```
TelemetryX-Applications-Library/
├── applications/          # Independent applications
│   └── [app-name]/       # Each application directory
│       ├── src/          # Source code
│       ├── dist/         # Built output (generated)
│       ├── package.json  # Own dependencies
│       ├── tsconfig.json # TypeScript config
│       ├── vite.config.ts # Build config
│       ├── CLAUDE.md     # App-specific AI guide
│       └── README.md     # App documentation
├── scripts/              # Utility scripts for managing apps
├── docs/                 # Shared documentation
├── README.md             # This repository's main documentation
└── CLAUDE.md            # This file - AI assistant guide
```

## Application Standards

### Each Application MUST Have

1. **Complete Independence**
   - Own `package.json` with all dependencies
   - Own build configuration (typically Vite)
   - Own TypeScript configuration
   - No shared code or dependencies with other apps

2. **TelemetryX SDK Integration**
   - `@telemetryx/sdk` as a dependency
   - Proper SDK initialization and usage
   - Configuration via `telemetry.config.json`

3. **Production Requirements**
   - TypeScript 5.7+ with strict mode
   - React 19.1+ (or similar modern framework)
   - Comprehensive error handling for 24/7 operation
   - Offline fallback capabilities
   - Memory leak prevention

4. **Documentation**
   - README.md with usage instructions
   - CLAUDE.md for AI assistance
   - Configuration examples
   - Troubleshooting guide

## Creating New Applications

### Directory Structure for New Apps

```
applications/[app-name]/
├── src/
│   ├── App.tsx               # Main app with React Router
│   ├── main.tsx              # Application entry point
│   └── views/
│       ├── Render.tsx        # Render view component
│       └── Settings.tsx      # Settings view component
├── assets/                   # Static assets
├── index.html               # HTML entry point
├── package.json             # Dependencies including @telemetryx/sdk
├── pnpm-lock.yaml           # Lock file
├── pnpm-workspace.yaml      # PNPM workspace configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── telemetry.config.json    # TelemetryX app configuration
└── README.md                # User documentation
```

### Application Configuration

#### telemetry.config.json Structure
```json
{
  "name": "app-name",
  "version": "0.1.0",
  "mountPoints": {
    "render": "/render",
    "settings": "/settings"
  },
  "devServer": {
    "runCommand": "vite --port 3000",
    "url": "http://localhost:3000"
  }
}
```

### Package.json Template
```json
{
  "name": "[app-name]",
  "version": "0.1.0",
  "description": "A telemetryX application",
  "scripts": {
    "dev": "tx serve"
  },
  "dependencies": {
    "@telemetryx/sdk": "^1.0.0-alpha23",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router": "^7.9.1"
  },
  "devDependencies": {
    "@telemetryx/cli": "^1.0.0-alpha23",
    "@rollup/plugin-typescript": "^12.1.2",
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.2",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
```

## Development Workflow

### Working with Individual Applications

```bash
# Navigate to an application
cd applications/[app-name]

# Install dependencies
npm install

# Development with TelemetryX harness
pnpm dev  # Runs 'tx serve'
# TelemetryX harness opens at http://localhost:6969
# Your app runs on http://localhost:3000

# Build for production (if configured)
pnpm run build

# Type checking (if configured)
pnpm run typecheck
```

### Testing with TelemetryX Development Harness

Each application uses the TelemetryX CLI development harness:
1. Navigate to your application: `cd applications/[app-name]`
2. Start the dev server: `pnpm dev` (runs `tx serve`)
3. The TelemetryX harness opens at http://localhost:6969
4. Your app runs on the port specified in telemetry.config.json (default 3000)
5. The harness provides SDK mocking, dual-view testing, and hot reload

## SDK Usage Patterns

### Basic SDK Initialization
```typescript
import { createClient } from '@telemetryx/sdk';

const client = createClient();

// Get device information
const deviceInfo = await client.device.getInfo();

// Store data
await client.storage.application.set('key', { data: 'value' });

// Subscribe to data updates
client.data.weather.subscribe((weather) => {
  console.log('Weather updated:', weather);
});
```

### Error Handling Pattern
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function AppErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-screen">
      <h1>Application Error</h1>
      <p>The application will reload in 30 seconds</p>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <YourMainComponent />
    </ErrorBoundary>
  );
}
```

## Design Guidelines

### Display Optimization
- **Viewing Distance**: Design for 6-10 feet viewing distance
- **Font Sizes**: Minimum 24px for body text, 48px for headers
- **Contrast**: High contrast ratios (WCAG AAA when possible)
- **Animation**: Smooth, subtle animations that don't distract
- **Layout**: Clear visual hierarchy, avoid clutter

### Performance Requirements
- **Memory**: Stay under 100MB RAM usage
- **CPU**: Keep under 10% CPU usage when idle
- **Updates**: Batch DOM updates, use React.memo appropriately
- **Network**: Implement retry logic with exponential backoff
- **Storage**: Clean up old data, implement data rotation

## Common Patterns

### Data Fetching with Caching
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useWeatherData = () => {
  const [data, setData] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      if (now - lastFetch < CACHE_DURATION) return;

      try {
        const weather = await client.data.weather.get();
        setData(weather);
        setLastFetch(now);
      } catch (error) {
        console.error('Weather fetch failed:', error);
        // Use cached data or show fallback
      }
    };

    fetchData();
    const interval = setInterval(fetchData, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [lastFetch]);

  return data;
};
```

### Offline Fallback
```typescript
const useDataWithFallback = (fetcher: () => Promise<any>, fallback: any) => {
  const [data, setData] = useState(fallback);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOffline) {
      fetcher()
        .then(setData)
        .catch(() => setData(fallback));
    }
  }, [isOffline]);

  return { data, isOffline };
};
```

## Testing Guidelines

### Local Testing
1. Build the application
2. Test with various screen sizes (1080p, 4K)
3. Simulate network interruptions
4. Run for extended periods (24+ hours)
5. Monitor memory usage

### Production Testing
1. Deploy to TelemetryX staging environment
2. Test on actual display hardware
3. Verify remote updates work
4. Test offline scenarios
5. Monitor performance metrics

## Security Considerations

### API Keys and Secrets
- NEVER commit API keys to the repository
- Use environment variables for development
- Use TelemetryX secure configuration for production

### Content Security
- Sanitize all user-generated content
- Validate all external data
- Implement rate limiting for API calls
- Use HTTPS for all external requests

## Troubleshooting Common Issues

### Issue: Application crashes after long runtime
**Solution**: Check for memory leaks in useEffect hooks, ensure proper cleanup

### Issue: Display appears blurry or text is hard to read
**Solution**: Increase font sizes, improve contrast, check display scaling

### Issue: Network requests failing
**Solution**: Implement retry logic, add offline fallbacks, check CORS

### Issue: Application not updating
**Solution**: Verify WebSocket connection, check subscription handlers

## Best Practices Checklist

When developing applications:
- [ ] TypeScript strict mode enabled
- [ ] Error boundaries implemented
- [ ] Offline fallbacks in place
- [ ] Memory leaks prevented (cleanup in useEffect)
- [ ] Font sizes optimized for distance viewing
- [ ] High contrast colors used
- [ ] Network retry logic implemented
- [ ] Data caching strategy defined
- [ ] Configuration documented
- [ ] README.md includes usage instructions
- [ ] Build outputs to dist/ directory
- [ ] telemetry.config.json properly configured

## Quick Reference

### Essential Commands
```bash
# Create a new application
tx init

# Build all applications
pnpm run build:all

# Create placeholder files
pnpm run app:placeholders

# Individual app development
cd applications/[app-name]
pnpm install
pnpm dev  # Runs 'tx serve', harness at localhost:6969
pnpm run build  # If build script is configured
```

### SDK Quick Reference
```typescript
// Client initialization
import { createClient } from '@telemetryx/sdk';
const client = createClient();

// Common APIs
await client.device.getInfo();
await client.storage.application.set(key, value);
await client.data.weather.get();
client.data.calendar.subscribe(callback);
```

### File Paths Convention
- Render mount: `/index.html`
- Settings mount: `/settings.html`
- Assets: `/assets/[...]`

## Resources

- **TelemetryX Documentation**: https://docs.telemetryx.ai
- **SDK Reference**: Available via @telemetryx/sdk package
- **Support**: Via in-app chat in TelemetryX dashboard

---

**Remember**: Every application in this library should be production-ready for 24/7 operation on commercial displays. Reliability, performance, and user experience are critical.