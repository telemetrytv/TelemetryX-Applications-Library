# Weather Application - AI Assistant Guide

## Overview
This is a standalone weather application for the TelemetryX platform. It displays real-time weather information, forecasts, and alerts on digital signage screens.

## Project Structure
```
weather/
├── src/                 # Source code
│   ├── App.tsx         # Main application component
│   ├── index.tsx       # Entry point
│   ├── types.ts        # TypeScript definitions
│   └── components/     # React components
├── dist/               # Built application (generated)
├── docs/               # Documentation
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── CLAUDE.md          # This file
```

## Development

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

### TelemetryX SDK Usage
The application uses the TelemetryX SDK for:
- Device location detection
- Data fetching and caching
- Hardware access (if needed)
- Error logging

```typescript
import { TelemetryX } from '@telemetryx/sdk';

// Get device location
const device = await TelemetryX.device.getInfo();
const location = device.location;

// Fetch weather data
const weather = await TelemetryX.data.fetch('weather', {
  location: location,
  units: 'metric'
});
```

## Key Requirements
1. **24/7 Operation**: No memory leaks, proper cleanup
2. **Offline Support**: Cache data for network failures
3. **Display Optimization**: Large text, high contrast
4. **Error Handling**: Graceful degradation
5. **Performance**: Efficient updates, minimal re-renders

## Configuration
The application accepts configuration via props:
- `location`: Location for weather (string or 'auto')
- `units`: Temperature units ('metric' or 'imperial')
- `refreshInterval`: Update frequency in milliseconds
- `theme`: Visual theme ('light', 'dark', 'auto')

## Building for Production
```bash
npm run build
```
This creates optimized files in the `dist/` directory ready for deployment to TelemetryX devices.

## Notes
- This is a completely independent application
- Does not depend on any root monorepo configuration
- Has its own build pipeline and dependencies
- Can be developed and deployed separately