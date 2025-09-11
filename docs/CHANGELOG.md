# Changelog

All notable changes to the TelemetryX Applications Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Calendar Versioning](https://calver.org/) using YYYY.MM.DD format.

## [2025.01.11] - SDK Bridge Architecture Migration

### Changed
- **Major SDK Architecture Update**: Transitioned from custom mock to official TelemetryX SDK integration
- **Bridge Implementation**: Updated development harness to use `bridge-stub.js` with `@telemetryx/root-sdk` Bridge class
- **File Organization**: Moved `dev-server.js` to `dev-harness/server.js` for improved project structure
- **Hello World Application**: Updated to use real `@telemetryx/sdk` instead of deprecated window.telemetryX global
- **Storage Patterns**: Enhanced SDK storage with proper scoped operations (account, application, device)
- **Real-time Subscriptions**: Improved data subscriptions using official Bridge messaging protocol

### Updated Documentation
- **CLAUDE.md**: Updated repository guide to reflect new Bridge implementation architecture
- **DEV_HARNESS.md**: Enhanced with detailed Bridge communication patterns and official SDK integration
- **applications/hello-world/CLAUDE.md**: Updated with modern SDK usage patterns and official import syntax
- **Architecture References**: Replaced all mock harness references with official SDK Bridge system

### Technical Improvements
- **Production Protocol**: Bridge-based client-server communication using same protocol as production
- **Official SDK Integration**: Proper message handling with `@telemetryx/root-sdk` Bridge class
- **Scoped Storage**: Storage operations now match production TelemetryX environment patterns
- **Enhanced Media Management**: Media folder and content operations via Bridge protocol
- **Development Parity**: Development environment now closely mirrors production TelemetryX platform

## [2025.09.04.1] - Code Quality Improvements

### Changed
- **Enhanced TypeScript configuration**: Added stricter compiler options including noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess, and exactOptionalPropertyTypes for improved type safety
- **Cleaned up imports**: Removed unused WeatherConfig import from App.tsx to eliminate dead code
- **Dependency version alignment**: Standardized react-dom version to maintain consistency across weather application

### Fixed
- **TypeScript strict mode compliance**: All weather application code now passes stricter TypeScript validation
- **Import optimization**: Eliminated unused imports to improve bundle size and code clarity

## [2025.09.04] - SDK Compliance Refactoring

### Added
- **SDK_GUIDE.md**: Comprehensive source of truth for TelemetryX SDK usage
- **telemetry.config.json**: Application configuration files for SDK compliance
- **Multi-entry build system**: Support for render.html and settings.html mount points
- **Real-time data subscriptions**: Using SDK store().realtime patterns
- **Offline caching**: Implemented store().deviceLocal for resilient data storage
- **Development harness**: Browser-based application preview with hot reload
- **Build scripts**: Independent application building and placeholder generation
- **Application catalog**: Weather, YouTube, RSS, Slack, Clock, Notice, and Calendar apps

### Changed
- **SDK imports**: Migrated from deprecated patterns to configure() and store() APIs
- **Application architecture**: Implemented proper settings ↔ render communication
- **Weather application**: Complete refactor for SDK Guide compliance
- **CLAUDE.md**: Updated to reference SDK_GUIDE.md and removed redundant content
- **README.md**: Comprehensive rewrite with application catalog and development guides
- **Package structure**: Each application now has independent dependencies

### Removed
- **Deprecated SDK interfaces**: Removed non-existent API patterns
- **Legacy build configuration**: Replaced with modern Vite multi-entry setup
- **Redundant documentation**: Consolidated SDK information into SDK_GUIDE.md

### Technical Changes
- Updated TypeScript to 5.7+ with strict mode
- Implemented ES Modules (ESM) throughout
- Added proper error boundaries and memory leak prevention
- Integrated offline-first data patterns
- Added comprehensive type safety
