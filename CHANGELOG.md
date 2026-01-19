# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation synchronization

## [0.1.0] - 2026-01-19

### Added

- Initial release of Ethereal desktop companion
- Transparent, frameless window with click-through support
- System monitoring: CPU, memory, network, disk I/O, battery status
- Ollama AI integration with conversation memory
- Dynamic sprite states: Idle, Working, Gaming, Browsing, Overheating, HighLoad, LowBattery, Thinking
- Mood system: Happy, Excited, Tired, Bored, Angry, Sad
- Global hotkeys (Ctrl+Shift+E for click-through, Ctrl+Shift+Q to quit)
- System tray with quick settings
- Configuration persistence via TOML
- Welcome modal for first-time users
- Settings modal with comprehensive options
- Multi-monitor support
- Clipboard monitoring for code/error detection
- Notification system for critical events
- Error boundary for crash recovery

### Technical

- Built with Tauri 2.0, React 19, TypeScript, Rust
- Uses Zustand 5 for state management
- Framer Motion for animations
- TailwindCSS 4 for styling
- Vitest 4 for testing
- Biome 2 for linting and formatting
