# TelemetryX Applications Library

<div align="center">
  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-22.0+-green.svg)](https://nodejs.org/)
[![TelemetryX SDK](https://img.shields.io/badge/TelemetryX%20SDK-Compatible-orange.svg)](https://telemetryx.ai)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Collection of independent applications for TelemetryX digital signage platform**

[Applications](applications/) | [Development](#development) | [Contributing](CONTRIBUTING.md)

</div>

---

## Overview

The **TelemetryX Applications Library** is a collection of **completely independent** applications for the TelemetryX platform - a low-code platform that enables full-fledged applications on digital screens using familiar web technologies.

Each application:
- Is completely standalone with its own `package.json`, build system, and dependencies
- Uses the TelemetryX SDK (`@telemetryx/sdk`) for device capabilities and data integration
- Can be developed, built, and deployed independently
- Has its own documentation and configuration

### Key Principles

- **Complete Independence**: Each app is a standalone project
- **No Shared Code**: Applications don't depend on each other
- **Own Dependencies**: Each app manages its own packages
- **SDK Integration**: All apps use `@telemetryx/sdk`
- **Development Harness**: Test all apps in one place

## Applications Catalog

### Current Applications

| Application | Description | Status | Use Cases |
|------------|-------------|---------|-----------|
| **[Hello World](applications/hello-world)** | Reference implementation demonstrating SDK integration and best practices | ✅ Production | Template, Learning, Development |

### Planned Applications

| Application | Description | Status | Use Cases |
|------------|-------------|---------|-----------|
| **Weather** | Dynamic weather displays with forecasts and alerts | 📋 Planned | Retail, Corporate, Public Spaces |
| **YouTube** | Video player with playlist management | 📋 Planned | Retail, Waiting Rooms |
| **RSS Feed** | News and content aggregator | 📋 Planned | Corporate, Healthcare |
| **Slack** | Team communication dashboard | 📋 Planned | Corporate, Tech Companies |
| **Clock** | World clocks with timezone support | 📋 Planned | Corporate, Transportation |
| **Calendar** | Event display with integrations | 📋 Planned | Meeting Rooms, Education |


## Quick Start

### Prerequisites

- Node.js 22+ and npm 10+
- TelemetryX SDK access (each app includes `@telemetryx/sdk`)

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/TelemetryTV/telemetryx-applications-library.git
cd telemetryx-applications-library

# Install dev harness dependencies only
npm install
```

### Individual Application Setup

```bash
# Navigate to any application
cd applications/weather

# Install application dependencies (including @telemetryx/sdk)
npm install

# Start development
npm run dev
```

### Development

```bash
# Start development harness (preview applications in browser)
npm run dev

# Build all applications independently
npm run build:all

# Generate placeholder HTML files
npm run app:placeholders
```

For individual applications:
```bash
cd applications/hello-world
npm install
npm run dev    # Start dev server
npm run build  # Build for production
```

### Development Harness

The repository includes a full-screen development harness for testing applications locally:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000 in your browser
3. Select an application from the dropdown (automatically loads first available app)
4. View render and settings interfaces side-by-side
5. Hot reload on file changes

The harness provides:
- **Dual iframe layout**: Render iframe (3/4 width, 1080p aspect ratio) and Settings iframe (1/4 width, full height)
- **Automatic application loading**: Dropdown automatically loads the selected application
- **Build integration**: Build applications directly from the harness interface
- **WebSocket-based hot reload**: Automatic refresh when files change
- **TelemetryX SDK integration**: Mock TelemetryX environment for development and testing

#### Harness Layout
- **Left panel (75% width)**: Main application render view at 1080p aspect ratio
- **Right panel (25% width)**: Application settings interface
- **Top header**: Application selector, reload/build controls, and connection status

## Architecture

### Repository Structure

```
telemetryx-applications-library/
├── applications/              # Independent applications
│   ├── weather/              
│   │   ├── src/              # Source code
│   │   ├── dist/             # Built application
│   │   ├── docs/             # App documentation
│   │   ├── package.json      # Own dependencies
│   │   ├── tsconfig.json     # Own TypeScript config
│   │   ├── vite.config.ts    # Own build config
│   │   ├── CLAUDE.md         # AI assistant guide
│   │   └── README.md         # App documentation
│   └── [other-apps]/         # Each with same structure
│
├── dev-harness/              # Development preview tool
│   └── index.html           # Browser-based app preview
│
├── scripts/                  # Utility scripts
│   ├── build-all-apps.js    # Build all apps independently
│   └── create-placeholder.js # Generate placeholder HTMLs
│
└── dev-server.js            # Development server for testing
```

### Technology Stack

Each application uses:
- **Runtime**: Node.js 22+ LTS
- **Language**: TypeScript 5.7+ with strict mode
- **Build Tool**: Vite for fast builds
- **Framework**: React 19+
- **Module System**: ES Modules (ESM)
- **TelemetryX SDK**: `@telemetryx/sdk` for platform integration

### Application Independence

Each application:
- Has its own `package.json` with `@telemetryx/sdk` dependency
- Has its own `tsconfig.json` for TypeScript configuration
- Has its own build configuration (typically `vite.config.ts`)
- Has its own `CLAUDE.md` for AI assistance
- Has its own documentation in `README.md`
- Builds to its own `dist/` directory
- Can be moved to a separate repository without changes

## TelemetryX SDK Usage

Each application includes `@telemetryx/sdk` as a dependency. For comprehensive SDK documentation, API reference, and usage examples, see **[SDK_GUIDE.md](SDK_GUIDE.md)**.

```json
// In each app's package.json
"dependencies": {
  "@telemetryx/sdk": "latest",
  "react": "^19.1.0",
  "react-dom": "^19.1.0"
}
```

## Working with Applications

### Building a Single Application

```bash
cd applications/weather
npm install  # Installs @telemetryx/sdk and other deps
npm run build
# Output is in applications/weather/dist/
```

### Building All Applications

```bash
# From repository root
npm run build:all
# Each app builds to its own dist/ folder
```

### Creating a New Application

1. Create a new folder in `applications/`
2. Copy structure from an existing app
3. Update `package.json` with app details
4. Ensure `@telemetryx/sdk` is in dependencies
5. Build and test independently

## Deployment

### To TelemetryX Cloud

1. Build your application:
```bash
cd applications/weather && npm run build
```

2. Deploy via TelemetryX CLI:
```bash
telemetryx deploy applications/weather/dist
```

3. Or use CI/CD integration:
```yaml
# .github/workflows/deploy.yml
- name: Deploy to TelemetryX
  uses: telemetrytv/deploy-action@v1
  with:
    app-path: applications/weather/dist
    api-key: ${{ secrets.TELEMETRYX_API_KEY }}
```

### Local Development

```bash
# Start development harness
npm run dev

# Open http://localhost:3000
# Select application from dropdown
# Preview with hot reload
```

## Development Guidelines

### Requirements
- TypeScript strict mode
- Error handling for 24/7 operation
- Memory leak prevention
- Offline fallbacks

### Design Considerations
- Optimize for viewing distance
- High contrast for visibility
- Responsive layouts
- Smooth animations

### Security
- No hardcoded API keys
- Input validation
- Secure data storage
- Rate limiting

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Submitting pull requests
- Reporting issues

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/telemetryx-applications-library.git

# Install dependencies
npm install

# Start development harness
npm run dev

# Type check your changes
npm run typecheck
```

## Community

- **GitHub**: [github.com/TelemetryTV](https://github.com/TelemetryTV)
- **Website**: [telemetryx.ai](https://telemetryx.ai)

## Resources

- [SDK Guide](SDK_GUIDE.md) - Comprehensive SDK documentation for LLMs
- [TelemetryX Documentation](https://docs.telemetryx.ai)
- [SDK Reference](https://sdk.telemetryx.ai)
- [Application Guidelines](docs/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/TelemetryTV/telemetryx-applications-library/issues)
- **Email**: developers@telemetryx.ai

## Acknowledgments

Built by the TelemetryX team and contributors.

---

<div align="center">

**[TelemetryX](https://telemetryx.ai)** - Transform Screens into Application Platforms

</div>
