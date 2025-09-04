# Hello World - TelemetryX Application

A simple Hello World application demonstrating TelemetryX platform best practices, built with React, TypeScript, and Tailwind CSS.

## Features

- **Customizable Message**: Settings page allows users to configure the display message
- **TelemetryX SDK Integration**: Uses TelemetryX storage system for persistent configuration
- **Responsive Design**: Optimized for digital display viewing with large, readable text
- **Real-time Updates**: Message changes in settings immediately update the display
- **Error Handling**: Comprehensive error boundaries and fallback states
- **TypeScript**: Fully typed with strict mode enabled
- **Shadcn UI**: Modern, accessible UI components for settings interface

## Architecture

### Main Application (`/index.html`)
- **Route**: `/index.html` (render view)
- **Purpose**: Displays the customizable message in large, readable text
- **Features**: Loading states, error handling, gradient backgrounds
- **SDK Integration**: Reads message from TelemetryX storage, listens for real-time updates

### Settings Interface (`/settings.html`)
- **Route**: `/settings.html` (configuration view)
- **Purpose**: Allows users to customize the display message
- **Features**: Form validation, save/reset functionality, live preview
- **UI Framework**: Shadcn UI components with Tailwind CSS styling

## Development

### Quick Start
```bash
cd applications/hello-world
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # TypeScript validation
```

### Project Structure
```
hello-world/
├── src/
│   ├── components/ui/    # Shadcn UI components
│   ├── lib/             # Utilities (cn function)
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Main app entry point
│   ├── settings.tsx     # Settings component
│   ├── settings-main.tsx # Settings entry point
│   ├── types.ts         # TypeScript definitions
│   └── index.css        # Tailwind CSS + custom variables
├── index.html           # Main application HTML
├── settings.html        # Settings page HTML
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Configuration

### Storage Schema
The application uses TelemetryX storage with the following schema:

```typescript
interface AppConfig {
  message: string;  // The display message (default: "Hello World")
}
```

**Storage Key**: `message`  
**Default Value**: `"Hello World"`

### Customization
- **Message Length**: Maximum 100 characters
- **Live Updates**: Changes in settings immediately reflect in the main display
- **Persistence**: Configuration persists across application restarts

## TelemetryX SDK Integration

### Storage Operations
```typescript
// Read current message
const message = await window.telemetryX.storage.get('message');

// Save new message
await window.telemetryX.storage.set('message', newMessage);

// Listen for changes
window.telemetryX.storage.onChange((key, value) => {
  if (key === 'message') {
    updateDisplay(value);
  }
});
```

### Error Handling
- **Storage Unavailable**: Falls back to default configuration
- **Network Issues**: Displays error state with fallback message
- **Invalid Data**: Validates and sanitizes stored values

## Display Optimization

### Typography
- **Large Text**: `text-6xl` to `text-8xl` for distance viewing
- **High Contrast**: Gradient text with strong color contrast
- **Responsive Sizing**: Uses `clamp()` for optimal scaling across screen sizes

### Visual Design
- **Gradient Backgrounds**: Subtle blue-to-indigo gradients
- **Card Layouts**: Clean, modern card-based design
- **Consistent Spacing**: Tailwind's spacing system for visual hierarchy

### Performance
- **Minimal Re-renders**: Strategic use of React hooks and state management
- **Lazy Loading**: Components load only when needed
- **Error Boundaries**: Prevents crashes from affecting the entire application

## Testing in Development Harness

### Local Testing
1. Navigate to repository root: `npm run dev`
2. Select "Hello World" from the dropdown
3. View main application in left pane, settings in right pane
4. Test real-time updates by changing message in settings

### Mock Environment
The development harness provides:
- **Mock Storage**: localStorage-based TelemetryX storage simulation
- **Real-time Updates**: WebSocket-based change notifications
- **Error Simulation**: Test error handling scenarios

## Deployment

### Building
```bash
npm run build
```

Generates optimized production files in `dist/`:
- `dist/index.html` - Main application
- `dist/settings.html` - Settings interface
- `dist/assets/` - Bundled JavaScript and CSS

### TelemetryX Platform
Deploy the `dist/` directory to TelemetryX platform with configuration:
```json
{
  "name": "hello-world",
  "mountPoints": {
    "render": { "path": "/index.html" },
    "settings": { "path": "/settings.html" }
  }
}
```

## Best Practices Demonstrated

1. **SDK Integration**: Proper use of TelemetryX storage and real-time updates
2. **TypeScript Strict Mode**: Full type safety with strict compiler options
3. **Error Handling**: Comprehensive error boundaries and fallback states
4. **Performance**: Optimized React patterns and minimal re-renders
5. **Accessibility**: Semantic HTML, proper contrast ratios, keyboard navigation
6. **Responsive Design**: Mobile-first approach with responsive typography
7. **Modern Tooling**: Vite for fast builds, Tailwind for utility-first CSS
8. **Code Organization**: Clean separation of concerns and modular architecture

## Troubleshooting

### Common Issues

**Storage not working in development**
- Ensure development harness is running
- Check browser console for TelemetryX mock availability

**Settings not updating display**
- Verify both render and settings iframes are loaded
- Check WebSocket connection in developer tools

**Build failures**
- Run `npm run typecheck` to identify TypeScript errors
- Ensure all dependencies are installed with `npm install`

### Development Tips
- Use the browser's developer tools to inspect TelemetryX mock calls
- Test with different message lengths and special characters
- Verify responsive behavior at different screen sizes
- Test error scenarios by temporarily disabling storage mock

## License

Part of the TelemetryX Applications Library. See repository root for licensing information.