# Desktop Ethereal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-windows-blue)](https://github.com/your-username/ethereal)
[![Version](https://img.shields.io/badge/version-0.1.0-orange)](https://github.com/your-username/ethereal)
[![CI](https://github.com/your-username/ethereal/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/ethereal/actions/workflows/ci.yml)

Desktop Ethereal is an interactive desktop companion that monitors your system activity and responds with dynamic behaviors. Built with Rust and Tauri, this ghost-like creature lives on your desktop and changes its appearance based on what you're doing.

*Note: This is a basic template with foundational structure. Core functionality is under development.*

![Desktop Ethereal Demo](public/demo.gif)

## Features

- **Transparent Ghost Window**: A frameless, always-on-top window *(Future implementation)*
- **System Awareness**: Monitors GPU temperature, active applications, and clipboard content *(Future implementation)*
- **Dynamic Behaviors**: Changes state based on your activities (coding, gaming, overheating) *(Future implementation)*
- **Animated Sprites**: Unique animations for each ethereal state *(Future implementation)*
- **LLM Integration**: Chat with your ethereal companion powered by Ollama *(Future implementation)*
- **Global Hotkey**: Toggle click-through mode with Ctrl+Shift+D *(Future implementation)*

## States

The ethereal has four distinct states: *(Future implementation)*

1. **IDLE**: Default state when no specific activity is detected
2. **CODING**: Activated when coding applications are in focus
3. **GAMING**: Activated when games are in focus
4. **OVERHEATING**: Activated when GPU temperature exceeds 80°C

## Requirements

- Windows 10/11 (primary support)
- [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) as the package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/ethereal.git
cd ethereal
```

2. Install dependencies with pnpm:

```bash
pnpm install
```

## Usage

Run in development mode:

```bash
pnpm tauri dev
```

Build for production:

```bash
pnpm tauri build
```

## Development

### Modern Development Tools

This project uses modern development tools for code quality and consistency:

- **Biome**: For TypeScript/React linting and formatting
- **Vitest**: For unit testing
- **Dev Containers**: For consistent development environments

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run Biome linter
- `pnpm lint:fix` - Run Biome linter and fix issues
- `pnpm format` - Format code with Biome
- `pnpm format:check` - Check code formatting with Biome
- `pnpm test` - Run tests with Vitest
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:run` - Run tests once
- `pnpm coverage` - Run tests and generate coverage report

### Containerized Development

This project includes Dev Container configuration for consistent development environments:

1. Open in VS Code with Remote-Containers extension
2. Or use GitHub Codespaces
3. All dependencies are pre-configured

## Controls

- **Ctrl+Shift+D**: Toggle click-through mode *(Future implementation)*
- **UI Buttons**: Manual toggle when not in click-through mode *(Future implementation)*
- **Drag**: Move window when not in click-through mode *(Future implementation)*

## Documentation

- [User Guide](docs/usage.md) - Detailed instructions on using Desktop Ethereal
- [Technical Documentation](docs/technical.md) - In-depth technical information
- [API Documentation](docs/api.md) - API reference for developers
- [Development Guide](docs/development.md) - Information for contributors
- [Deployment Guide](docs/deployment.md) - Instructions for packaging and distribution
- [Roadmap](docs/roadmap.md) - Future plans and features
- [Contributing](docs/contributing.md) - Guidelines for contributing to the project

## Project Structure

```text
ethereal/
├── src/                 # Frontend React components
│   ├── components/      # Sprite component
│   ├── stores/          # Zustand stores for state management
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main application
│   └── main.tsx         # Entry point
├── src-tauri/           # Backend Rust code
│   ├── src/
│   │   ├── main.rs      # Entry point
│   │   └── lib.rs       # Core application logic
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── public/sprites/      # Sprite images (to be populated) *(Future implementation)*
└── package.json         # Frontend dependencies
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Linting**: Biome checks
- **Testing**: Unit tests with Vitest
- **Building**: Cross-platform builds for Windows, macOS, and Linux
- **Releasing**: Automatic release creation on tag

## Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/contributing.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tauri](https://tauri.app/) for the amazing desktop framework
- [Rust](https://www.rust-lang.org/) for the robust backend
- [Ollama](https://ollama.com/) for local LLM capabilities *(Future implementation)*
- NVIDIA for GPU monitoring libraries *(Future implementation)*
