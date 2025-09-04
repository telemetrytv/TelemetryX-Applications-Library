# Changelog

All notable changes to the TelemetryX Applications Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Calendar Versioning](https://calver.org/) using YYYY.MM.DD format.

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
