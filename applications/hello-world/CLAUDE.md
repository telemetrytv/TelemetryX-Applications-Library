# Hello World Application - AI Assistant Guide

## Application Overview

This is a **Hello World application** for the TelemetryX platform that demonstrates all the key best practices and patterns used throughout the Applications Library. It serves as a reference implementation and starting point for new applications.

## Key Features & Architecture

### Core Functionality
- **Simple Message Display**: Shows customizable text in large, readable format
- **Settings Interface**: Shadcn UI-based form for message configuration
- **Real-time Updates**: Changes in settings immediately update the main display
- **Storage Integration**: Uses TelemetryX SDK storage system for persistence

### Technical Stack
- **React 19.1+**: Modern React with hooks and strict mode
- **TypeScript 5.7+**: Strict type checking and modern language features
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Modern, accessible component library
- **Vite**: Fast development and optimized production builds
- **TelemetryX SDK**: Platform integration and storage

## Project Structure & Files

```
applications/hello-world/
├── src/
│   ├── components/ui/           # Shadcn UI components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input field component  
│   │   ├── label.tsx           # Label component
│   │   └── card.tsx            # Card layout components
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn helper)
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Main app entry point
│   ├── settings.tsx            # Settings page component
│   ├── settings-main.tsx       # Settings entry point
│   ├── types.ts                # TypeScript type definitions
│   └── index.css              # Tailwind CSS + design system
├── index.html                  # Main application route (/index.html)
├── settings.html              # Settings route (/settings.html)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript strict configuration
├── vite.config.ts             # Multi-entry build configuration
├── tailwind.config.js         # Tailwind + Shadcn configuration
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Complete documentation
└── CLAUDE.md                  # This AI assistant guide
```

## Key Implementation Patterns

### 1. TelemetryX SDK Integration
```typescript
// Import the official SDK
import * as sdk from '@telemetryx/sdk';

// Configure SDK with application name
sdk.configure('hello-world');

// Usage in components
const store = sdk.store();
const config = await store.application.get<AppConfig>('config');
await store.application.set('config', newConfig);

// Subscribe to changes
await store.application.subscribe('config', (newConfig) => {
  // Handle configuration updates
});
```

### 2. TypeScript Configuration
- **Strict Mode**: All strict compiler options enabled
- **ES2023 Target**: Modern JavaScript features
- **Path Aliases**: `@/*` mapped to `./src/*`
- **Comprehensive Type Safety**: No `any` types, proper interfaces

### 3. Error Handling Patterns
```typescript
// Comprehensive error boundaries
class AppErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppErrorBoundary';
  }
}

// Async error handling with fallbacks
try {
  const data = await window.telemetryX.storage.get('message');
  setConfig(data || DEFAULT_CONFIG);
} catch (err) {
  console.error('Storage error:', err);
  setError(err.message);
  setConfig(DEFAULT_CONFIG); // Always provide fallback
}
```

### 4. Display Optimization
```typescript
// Large, readable text for digital displays
const styles = {
  fontSize: 'clamp(24px, 4vw, 72px)', // Responsive scaling
  background: 'gradient-to-r from-blue-600 to-indigo-600',
  contrast: 'high' // WCAG AAA compliance
};
```

### 5. State Management Pattern
```typescript
// Centralized state with proper typing
interface AppState {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
}

// Loading and error states in all components
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 6. Build Configuration
- **Multi-entry**: Both main app and settings page
- **ES Modules**: Modern module system
- **Source maps**: Development debugging
- **Path resolution**: Clean imports with aliases

## Storage Schema

### Configuration Object
```typescript
interface AppConfig {
  message: string; // The display message
}

const DEFAULT_CONFIG: AppConfig = {
  message: "Hello World"
};
```

### Storage Operations
- **Key**: `'message'` (string)
- **Default**: `"Hello World"`
- **Validation**: String type checking and fallbacks
- **Real-time**: Automatic updates via onChange listener

## Development Workflow

### Commands
```bash
cd applications/hello-world
npm install          # Install dependencies
npm run dev          # Start development server (port 5174)
npm run build        # Build for production
npm run typecheck    # Validate TypeScript
npm run preview      # Preview production build
```

### Testing in Harness
1. From repository root: `npm run dev`
2. Navigate to localhost:3000
3. Select "Hello World" from dropdown
4. Test real-time updates between render and settings views

## Common Development Patterns

### 1. Component Creation
- Always start with TypeScript interfaces
- Include loading and error states
- Use proper error boundaries
- Follow Shadcn UI patterns for consistency

### 2. Storage Integration
```typescript
// SDK is always available via npm package
import * as sdk from '@telemetryx/sdk';

// Use scoped storage operations
const store = sdk.store();

// Always include error handling
try {
  await store.application.set('config', value);
} catch (error) {
  // Handle gracefully with fallback
  console.error('Storage error:', error);
  // Provide default configuration
}
```

### 3. Settings Forms
- Use Shadcn UI components for consistency
- Include validation and feedback
- Provide real-time preview
- Include reset functionality
- Show save states (loading, success, error)

### 4. Responsive Design
```typescript
// Use Tailwind's responsive utilities
className="text-2xl sm:text-4xl lg:text-6xl"

// Consider viewing distance for digital displays
fontSize: 'clamp(24px, 4vw, 72px)'
```

## Extension Points

### Adding New Settings
1. Update `AppConfig` interface in `types.ts`
2. Add form fields to `settings.tsx`
3. Update storage operations
4. Add validation logic
5. Update preview functionality

### Adding New Features
1. Create new components in `components/`
2. Follow existing error handling patterns
3. Update TypeScript types
4. Add appropriate documentation
5. Test in development harness

### UI Customization
1. Extend Tailwind configuration
2. Add new CSS custom properties
3. Create new Shadcn UI components
4. Maintain design consistency
5. Test responsive behavior

## Best Practices Checklist

When working on this application:

- [ ] **TypeScript**: Use strict mode, no `any` types
- [ ] **Error Handling**: Comprehensive try/catch, fallback states
- [ ] **Storage**: Check SDK availability, validate data types
- [ ] **UI**: Use Shadcn components, maintain consistency
- [ ] **Responsive**: Test at different screen sizes
- [ ] **Performance**: Minimize re-renders, use proper dependencies
- [ ] **Accessibility**: Semantic HTML, proper contrast
- [ ] **Documentation**: Update README.md for significant changes

## Troubleshooting Guide

### TypeScript Errors
- Run `npm run typecheck` to identify issues
- Check interface definitions in `types.ts`
- Ensure proper type assertions for SDK calls

### Build Failures
- Verify all imports are correct
- Check Vite configuration for entry points
- Ensure Tailwind CSS is properly configured

### Storage Issues
- Check browser console for TelemetryX mock
- Verify development harness is running
- Test storage operations manually in dev tools

### UI Issues
- Verify Shadcn component imports
- Check Tailwind class names
- Test responsive behavior at different breakpoints

## AI Assistant Recommendations

When asked to work on this application:

1. **Follow Established Patterns**: Use the existing code as a template
2. **Maintain Type Safety**: Always add proper TypeScript types
3. **Test Integration**: Ensure changes work in the development harness
4. **Update Documentation**: Modify README.md for significant changes
5. **Preserve Best Practices**: Don't compromise on error handling or performance

This application serves as the **gold standard** for TelemetryX Applications Library implementations. All new applications should follow these patterns and practices.