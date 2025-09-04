# TelemetryX Applications Library - AI Assistant Guide

## Repository Overview

This is the **TelemetryX Applications Library** - a collection of **completely independent** applications for the TelemetryX platform. Each application is standalone with its own dependencies, build system, and documentation.

## Key Context

### What is TelemetryX?
TelemetryX is a low-code platform for digital screens that enables full-fledged applications using familiar web technologies. For detailed SDK information and API reference, see **[SDK_GUIDE.md](SDK_GUIDE.md)**.

### Repository Purpose
This library provides:
1. **Independent Applications**: Weather, YouTube, RSS, Slack, Clock, Dashboard, etc.
2. **Development Harness**: Browser-based preview environment
3. **Build Scripts**: Tools to build all applications independently

## Architecture Guidelines

### Repository Structure
```
applications/          # Independent applications
  weather/            # Complete standalone app
    src/              # Source code
    dist/             # Built output
    package.json      # Own dependencies
    tsconfig.json     # Own TypeScript config
    vite.config.ts    # Own build config
    CLAUDE.md         # App-specific AI guide
  [other-apps]/       # Each fully independent
dev-harness/          # Development preview tool
scripts/              # Utility scripts
dev-server.js         # Test server
```

### Each Application Has:
- **Own package.json**: Independent dependencies including `@telemetryx/sdk`
- **Own build system**: Typically Vite for fast builds
- **Own TypeScript config**: Tailored to app needs
- **Own documentation**: README.md and CLAUDE.md
- **No shared dependencies**: Complete isolation

## Development Standards

### Application Requirements
Each application MUST:
1. Be completely independent (own package.json, build system)
2. Include `@telemetryx/sdk` as a dependency
3. Use TypeScript 5.7+ with strict mode
4. Use React 19.1+
5. Build to its own dist/ directory
6. Include comprehensive error handling for 24/7 operation
7. Support offline fallbacks
8. Be optimized for display from distance

### Code Patterns

For comprehensive SDK patterns, architecture, and code examples, refer to **[SDK_GUIDE.md](SDK_GUIDE.md)**.

#### Display Optimization
```typescript
// Design for readability at distance
const styles = {
  fontSize: 'clamp(24px, 4vw, 72px)', // Responsive sizing
  contrast: 'high',                    // WCAG AAA compliance
  animation: 'subtle'                  // Avoid distracting motion
};
```

## Creating New Applications

### Steps for New Apps
1. Create new folder in `applications/`
2. Copy structure from existing app (like weather)
3. Create own `package.json` with `@telemetryx/sdk` dependency
4. Create own `tsconfig.json` and build config
5. Create own `CLAUDE.md` for AI assistance
6. Implement application logic
7. Document usage and configuration

### Required Files
```
applications/[app-name]/
  src/
    App.tsx           # Main component
    index.tsx         # Entry point
    types.ts          # TypeScript types
  dist/              # Built output (generated)
  docs/              # Documentation
  package.json       # Own dependencies (@telemetryx/sdk)
  tsconfig.json      # Own TypeScript config
  vite.config.ts     # Own build config
  CLAUDE.md          # AI assistant guide
  README.md          # App documentation
  .gitignore         # Git ignore rules
```

## Application Development

### Development Workflow
1. Navigate to application: `cd applications/weather`
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Build for production: `npm run build`
5. Test in dev harness: Go to root and run `npm run dev`

### Independence Requirements
- Each app must build without any other apps
- Each app has its own node_modules
- Each app can be moved to separate repository
- No shared code between applications
- All dependencies declared in app's package.json

## Application Patterns

### Package.json Structure
```json
{
  "name": "telemetryx-[app-name]-app",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@telemetryx/sdk": "latest",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0",
    "vite": "^5.4.0"
  }
}
```

### SDK Usage
For detailed SDK usage patterns, data fetching, storage, and API examples, see **[SDK_GUIDE.md](SDK_GUIDE.md)**.

### State Management
```typescript
// Prefer Context API for simple state
const AppContext = createContext<AppState>({});

// Use Zustand for complex state
const useStore = create<StoreState>((set) => ({
  data: null,
  updateData: (data) => set({ data })
}));
```

### Error Boundaries
```typescript
// Always wrap applications in error boundaries
class AppErrorBoundary extends Component {
  componentDidCatch(error: Error) {
    console.error('Application error:', error);
    // Show fallback UI
  }
}
```

## Performance Optimization

### Key Principles
1. **Minimize Re-renders**: Use memo, useMemo, useCallback appropriately
2. **Lazy Load**: Split code for features not immediately visible
3. **Cache Aggressively**: Store API responses, computed values
4. **Debounce Updates**: Batch rapid state changes
5. **Optimize Images**: Use appropriate formats and sizes

### Memory Management
```typescript
// Clean up timers and subscriptions
useEffect(() => {
  const timer = setInterval(updateData, 30000);
  return () => clearInterval(timer);
}, []);

// Use weak references for large objects
const cache = new WeakMap();
```

## Security Guidelines

### API Keys
- NEVER commit API keys to the repository
- Use environment variables for development
- Use TelemetryX secure storage in production

### Data Validation
```typescript
// Always validate external data
const validateApiResponse = (data: unknown): ValidData => {
  if (!isValidSchema(data)) {
    throw new ValidationError('Invalid data schema');
  }
  return data as ValidData;
};
```

### Content Security
- Sanitize user-generated content
- Use CSP headers appropriately
- Validate URLs before fetching
- Implement rate limiting for API calls

## Deployment Considerations

### Build Configuration
Applications are built using modern tooling:
- ES2023 target for modern JavaScript features
- ES Modules for tree-shaking and optimization
- Source maps for development debugging

### Development Workflow
- Type checking with TypeScript 5.7+
- Build with Turborepo
- Local development harness with hot reload
- Deployment via TelemetryX CLI or GitHub integration

## SDK Features Available

For comprehensive SDK features, APIs, and capabilities, see **[SDK_GUIDE.md](SDK_GUIDE.md)**.

Key categories include:
- Device capabilities and hardware integration
- Storage system with multiple scopes
- Data integration and real-time subscriptions
- Configuration and application lifecycle

## Common Issues and Solutions

### Issue: Application crashes after long runtime
**Solution**: Implement proper cleanup in useEffect hooks, use error boundaries

### Issue: Data updates causing flicker
**Solution**: Use double buffering pattern, update state atomically

### Issue: Poor text readability
**Solution**: Use high contrast, appropriate font sizes, consider viewing distance

### Issue: Network interruptions
**Solution**: Implement offline fallbacks, cache critical data, retry logic

## Best Practices Summary

1. **Always assume 24/7 operation** - No memory leaks, proper cleanup
2. **Design for distance viewing** - Large text, high contrast
3. **Handle all error cases** - Network, API, hardware failures
4. **Optimize for performance** - Lazy loading, caching, debouncing
5. **Follow TypeScript strictly** - No `any` types, proper interfaces
6. **Document thoroughly** - Configuration, usage, troubleshooting
7. **Test comprehensively** - Unit, integration, performance tests
8. **Security first** - No exposed secrets, validate all data
9. **Use SDK features** - Don't reinvent platform capabilities
10. **Consider offline scenarios** - Cached data, fallback content

## Quick Commands

### Repository Level
```bash
npm run dev                    # Start development harness
npm run build:all              # Build all applications independently
npm run app:placeholders       # Create placeholder HTML files
```

### Application Level
```bash
cd applications/weather        # Navigate to app
npm install                    # Install app dependencies
npm run dev                    # Start app dev server
npm run build                  # Build app for production
npm run typecheck              # TypeScript validation
```

### Deployment
```bash
cd applications/weather
npm run build                  # Build the application
# Deploy dist/ folder to TelemetryX
```

## Resources

- **SDK Guide**: [SDK_GUIDE.md](SDK_GUIDE.md) - Comprehensive SDK documentation
- **TelemetryX SDK Docs**: https://sdk.telemetryx.ai
- **Platform Documentation**: https://docs.telemetryx.ai
- **Design Guidelines**: docs/design-guidelines.md
- **API Reference**: https://api.telemetryx.ai
- **Support**: developers@telemetryx.ai

## Contributing Checklist

When contributing to this repository:
- [ ] Follow TypeScript strict mode
- [ ] Include comprehensive error handling
- [ ] Add offline fallbacks
- [ ] Write tests for new features
- [ ] Update documentation
- [ ] Consider 24/7 operation requirements
- [ ] Optimize for digital display viewing
- [ ] Follow security best practices
- [ ] Use existing SDK features
- [ ] Include configuration schema

---

**Remember**: Applications in this library run on commercial digital signage displays that operate 24/7 in public spaces. Reliability, performance, and user experience are critical.