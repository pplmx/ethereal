# Development Guide

This guide provides information for developers who want to contribute to or extend Desktop Ethereal.

## Project Structure

```text
ethereal/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   └── SpriteAnimator.tsx # Sprite animation component
│   ├── stores/             # Zustand stores
│   │   └── spriteStore.ts  # Ethereal state management
│   ├── lib/                # Utility functions
│   │   └── utils.ts        # Helper functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Frontend entry point
├── src-tauri/              # Backend source code
│   ├── src/                # Rust source code
│   │   ├── main.rs         # Entry point
│   │   └── lib.rs          # Main Rust application
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── public/                 # Static assets
│   └── sprites/            # Sprite images (future implementation)
├── docs/                   # Documentation
│   ├── usage.md            # User guide
│   ├── technical.md        # Technical documentation
│   └── api.md              # API documentation
├── package.json            # Frontend dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Setting Up Development Environment

### Prerequisites

1. **Rust**: Install via [rustup](https://www.rust-lang.org/tools/install)
2. **Node.js**: Install from [nodejs.org](https://nodejs.org/)
3. **pnpm**: Install from [pnpm.io](https://pnpm.io/installation)

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/pplmx/ethereal.git
   cd ethereal
   ```

2. Install frontend dependencies:

   ```bash
   pnpm install
   ```

3. Verify Rust installation:

   ```bash
   rustc --version
   cargo --version
   ```

## Development Workflow

### Running in Development Mode

```bash
pnpm tauri dev
```

This command will:

1. Start the Vite development server
2. Compile the Rust backend
3. Launch the Tauri application

Changes to frontend code will hot-reload automatically.
Changes to backend code require restarting the application.

### Building for Production

```bash
pnpm tauri build
```

This command will:

1. Build the frontend for production
2. Compile the Rust backend for release
3. Package the application for distribution

### Code Organization

#### Frontend (TypeScript/React)

- **Components**: Reusable UI elements
- **Stores**: Zustand stores for state management
- **Lib**: Utility functions and helpers
- **Assets**: Static assets like images and styles

#### Backend (Rust)

- **Main Module**: Entry point (`main.rs`)
- **Library Module**: Main application logic (`lib.rs`)
- **Commands**: Tauri command handlers (future implementation)
- **Plugins**: Tauri plugins and extensions

## Code Standards

### TypeScript/JavaScript

Follow these guidelines:

- Use TypeScript for all frontend code
- Strict typing is enforced
- Use functional components with hooks
- Follow React best practices
- Use Biome for code formatting and linting

### Rust

Follow these guidelines:

- Use Rust 2021 edition
- Follow Rust naming conventions
- Use `clippy` for linting
- Handle errors appropriately with `Result` types
- Use async/await for asynchronous operations

### Styling

- Use TailwindCSS for styling
- Keep CSS minimal and scoped to components
- Use consistent spacing and colors

## Testing

### Frontend Testing

The project uses **Vitest** + **React Testing Library** for testing.

#### Integration Testing Strategy (Recommended)

We prioritize integration tests to verify full feature flows.

**Key Patterns:**

1. **Mocking Time**: Use `vi.useFakeTimers({ shouldAdvanceTime: true })` for animations.

    ```typescript
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    ```

2. **Mocking Audio**:

    ```typescript
    vi.stubGlobal('Audio', vi.fn().mockImplementation(() => ({
      play: vi.fn(),
      volume: 1,
    })));
    ```

3. **State Reset**: Always reset Zustand stores in `beforeEach`.

#### Unit Testing

Use Vitest for testing pure logic (e.g., utility functions, store reducers).

To run tests:

```bash
pnpm test
```

### Backend Testing

For Rust testing:

1. **Unit Testing**: Use Rust's built-in testing framework
2. **Integration Testing**: Test Tauri commands and event handling
3. **System Testing**: Test system integration components

Example unit test in Rust:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

## Debugging

### Frontend Debugging

1. Use browser DevTools (Ctrl+Shift+I)
2. Check console for errors and logs
3. Use React DevTools for component inspection
4. Add `console.log` statements for debugging

### Backend Debugging

1. Check terminal output for Rust compilation errors
2. Use `dbg!` macro for debugging in Rust code
3. Add logging with the `tracing` crate for more detailed debugging
4. Use IDE debugging capabilities (if available)

### Common Debugging Scenarios

#### 1. IPC Communication Issues

- Check that commands are properly registered in `lib.rs`
- Verify that the frontend is calling the correct command names
- Check Tauri logs for IPC errors

#### 2. Event Handling Problems

- Verify that events are being emitted from the backend (future implementation)
- Check that the frontend is listening to the correct event names
- Ensure payloads match expected structures

#### 3. Animation Issues

- Verify sprite images exist in the correct location (future implementation)
- Check that file paths in animation configuration are correct
- Ensure images are valid PNG files

## Extending Functionality

### Adding New States

1. Add the new state to the `EtherealState` type in `spriteStore.ts`
2. Add animation configuration in `animations.ts` (future implementation)
3. Update the state machine logic in the store
4. Add categorization logic in `lib.rs` if needed (future implementation)
5. Add any necessary backend monitoring if required (future implementation)

### Adding New Monitors

1. Create a new background task in the `setup` function in `lib.rs` (future implementation)
2. Add new state management structures
3. Implement event emission for frontend consumption (future implementation)
4. Add frontend listeners and state updates

### Adding New UI Components

1. Create new components in the `components` directory
2. Follow existing patterns for props and state management
3. Add necessary styling with TailwindCSS
4. Integrate with existing application state

## Performance Optimization

### Frontend Optimization

1. **Memoization**: Use `React.memo` for components that render frequently
2. **Lazy Loading**: Load components and resources only when needed
3. **Bundle Optimization**: Minimize bundle size with code splitting
4. **Image Optimization**: Use appropriate image formats and sizes
5. **Animation Optimization**: Use CSS transforms and hardware acceleration

### Backend Optimization

1. **Threading**: Use appropriate threading for background tasks
2. **Caching**: Cache expensive computations
3. **Polling Intervals**: Adjust intervals based on importance
4. **Resource Management**: Properly manage system resources

## Security Considerations

When contributing, keep these security principles in mind:

1. **Data Privacy**: Ensure no user data is transmitted without consent
2. **Permissions**: Only request necessary system permissions
3. **Input Validation**: Validate all inputs, especially from IPC calls
4. **Error Handling**: Don't expose sensitive information in error messages
5. **Dependency Management**: Regularly update dependencies to address security vulnerabilities

## Contributing Guidelines

### Issue Reporting

When reporting issues, include:

1. Clear description of the problem
2. Steps to reproduce
3. Expected vs. actual behavior
4. System information (OS, GPU, etc.)
5. Screenshots if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Code Review Process

All pull requests must:

1. Pass all tests
2. Follow coding standards
3. Include appropriate documentation
4. Be reviewed by at least one maintainer

## Release Process

### Versioning

Follow semantic versioning (SemVer):

- MAJOR version for incompatible changes
- MINOR version for feature additions
- PATCH version for bug fixes

### Release Steps

1. Update version in `package.json` and `src-tauri/Cargo.toml`
2. Update CHANGELOG.md
3. Create a git tag
4. Build for all platforms
5. Create GitHub release
6. Publish to distribution channels

## Troubleshooting Development Issues

### Common Development Problems

#### 1. Dependencies Not Installing

```bash
# Clear pnpm store cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Rust Compilation Errors

```bash
# Update Rust toolchain
rustup update

# Check for known issues
cargo check

# Clean and rebuild
cargo clean
cargo build
```

#### 3. Tauri Build Failures

```bash
# Update Tauri CLI
cargo install tauri-cli --force

# Check Tauri environment
npm run tauri info
```

### Environment Variables

The application may use environment variables for configuration:

- `DEBUG`: Enable debug logging
- `OLLAMA_HOST`: Custom Ollama endpoint
- `POLL_INTERVAL`: Custom polling intervals

## Advanced Topics

### Customizing the Build Process

Modify `vite.config.ts` for frontend build customization.
Modify `src-tauri/Cargo.toml` for backend dependencies and features.

### Platform-Specific Code

Use conditional compilation in Rust:

```rust
#[cfg(target_os = "windows")]
// Windows-specific code

#[cfg(target_os = "macos")]
// macOS-specific code
```

### Feature Flags

Use Cargo features for optional functionality:

```toml
[features]
default = []
gpu-monitoring = ["nvml-wrapper"]
```

## Resources

### Documentation

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://reactjs.org/)
- [Rust Documentation](https://doc.rust-lang.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### Community

- Tauri Discord server
- Rust community forums
- React community resources

### Tools

- Rust analyzer for IDE support
- Tauri CLI for development
- Vite for frontend tooling
