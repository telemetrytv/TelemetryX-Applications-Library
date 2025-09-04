# Contributing to TelemetryX Applications Library

Thank you for your interest in contributing to the TelemetryX Applications Library! We welcome contributions from the community to help expand and improve our collection of digital signage applications.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept responsibility for mistakes

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use issue templates when available
3. Provide clear reproduction steps
4. Include relevant system information
5. Add screenshots or videos when applicable

### Suggesting Enhancements

1. Open a discussion first for major changes
2. Clearly describe the problem and solution
3. Explain why this enhancement would be useful
4. Consider implementation complexity

### Pull Requests

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Make your changes
4. Write or update tests
5. Update documentation
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 22+ and npm 10+
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/telemetryx-applications-library.git
cd telemetryx-applications-library

# Install dependencies
npm install

# Start development harness
npm run dev

# Open http://localhost:3000 in your browser
```

## Application Development Guidelines

### Creating a New Application

1. Create a new folder in `applications/`
2. Follow the application structure:
```
applications/your-app/
├── src/
│   ├── App.tsx           # Main component
│   ├── index.tsx         # Entry point
│   ├── types.ts          # TypeScript types
│   └── config.ts         # Configuration schema
├── assets/               # Images and icons
├── tests/                # Test files
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # Documentation
```

3. Implement required interfaces:
```typescript
interface TelemetryXApplication {
  id: string;
  name: string;
  version: string;
  config: ApplicationConfig;
  onMount(): Promise<void>;
  onUnmount(): Promise<void>;
  onConfigUpdate(config: ApplicationConfig): void;
}
```

### Design Principles

#### 1. Reliability (24/7 Operation)
- Implement error boundaries
- Handle network failures gracefully
- Prevent memory leaks
- Clean up resources properly

#### 2. Performance
- Optimize for continuous operation
- Minimize re-renders
- Implement efficient data caching
- Use lazy loading when appropriate

#### 3. Accessibility
- Design for viewing from distance
- Use high contrast colors
- Ensure text readability
- Support different screen sizes

#### 4. User Experience
- Provide smooth animations
- Show loading states
- Display helpful error messages
- Support offline mode

### Code Standards

#### TypeScript
- Use strict mode
- No `any` types
- Define proper interfaces
- Document complex types

#### React
- Use functional components
- Implement proper hooks cleanup
- Memoize expensive computations
- Handle all component states

#### Testing
- Write unit tests for utilities
- Test component rendering
- Mock external dependencies
- Test error scenarios

#### Documentation
- Include README for each app
- Document configuration options
- Provide usage examples
- Explain design decisions

## Code Standards

### TypeScript
- Use TypeScript 5.7+ with strict mode
- No `any` types
- Define proper interfaces
- Use ES modules

### Application Requirements
- Handle 24/7 operation
- Implement error boundaries
- Include offline fallbacks
- Optimize for viewing distance

## Development Workflow

### Repository Level
```bash
# Start development harness (preview all apps)
npm run dev

# Build all applications independently
npm run build:all
```

### Application Level
```bash
# Work on specific application
cd applications/weather
npm install          # Install app dependencies
npm run dev          # Start app dev server
npm run build        # Build app to dist/
npm run typecheck    # TypeScript validation
```

### Development Harness Features
- Preview any application in iframe
- Hot reload on file changes
- Resolution presets (720p, 1080p, 4K)
- Build status indicators

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Examples:
```
feat(weather): add severe weather alerts
fix(youtube): handle playlist loading errors
docs(readme): update installation instructions
```

## Submission Process

### Before Submitting

- [ ] Type checking passes (`npm run typecheck`)
- [ ] Application works in dev harness
- [ ] Documentation updated
- [ ] No hardcoded API keys
- [ ] Memory leaks addressed
- [ ] Offline fallbacks implemented

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Tested on TelemetryX device/simulator

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## Review Process

1. **Type Checking**: Ensure TypeScript passes
2. **Code Review**: Maintainers review code quality
3. **Testing**: Test in development harness
4. **Feedback**: Address review comments
5. **Merge**: Approved PRs merged to main branch

## Release Process

1. Changes merged to main branch
2. Version bumped according to semver
3. Changelog updated
4. Tagged release created
5. Deployed to TelemetryX registry

## Community

### Getting Help

- GitHub Issues: Bug reports and feature requests
- Email: developers@telemetryx.ai

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes

## Legal

### License

By contributing, you agree that your contributions will be licensed under the MIT License.

### Contributor License Agreement

For substantial contributions, we may request a CLA to ensure:
- You have the right to contribute
- You grant us license to use your contributions
- You understand the implications

## Resources

- [TelemetryX Documentation](https://docs.telemetryx.ai)
- [SDK Reference](https://sdk.telemetryx.ai)
- [Application Guidelines](docs/)

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues
3. Email developers@telemetryx.ai

Thank you for contributing to TelemetryX Applications Library!