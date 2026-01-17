# Technical Documentation

This document provides detailed technical information about the Desktop Ethereal implementation.

## Architecture Overview

Desktop Ethereal follows a frontend-backend architecture using Tauri:

- **Frontend**: React with TypeScript for UI and user interactions
- **Backend**: Rust for system-level operations and performance-critical tasks
- **Communication**: Tauri's IPC (Inter-Process Communication) system

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Sprite    │  │ spriteStore  │  │   Animations       │ │
│  │ Component   │  │    Store     │  │   Config           │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Event Listeners                       ││
│  │  GPU Updates ◄──┐  Window Updates ◄──┐  Clipboard ◄──┐ ││
│  └─────────────────┼────────────────────┼────────────────┼─┘│
└────────────────────┼────────────────────┼────────────────┼──┘
                     ▼                    ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend (Rust)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ GPU Monitor │  │ Window Watch │  │ Clipboard Monitor  │ │
│  │   Thread    │  │    Thread    │  │      Thread        │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Command Handlers                     ││
│  │       greet       set_click_through  get_gpu_stats        ││
│  │                     chat_with_ethereal                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

*Note: Some components are planned for future implementation and are not yet available in the current version.*

## Backend Implementation (Rust)

### Main Components

#### 1. State Management

The current implementation is a basic template with limited functionality. Future versions will include:

Three state objects are managed by Tauri:

```rust
struct ClickThroughState(Mutex<bool>);
struct GpuMonitorState {
  last_stats: Mutex<Option<GpuStats>>,
}
struct WindowMonitorState {
  last_window: Mutex<Option<WindowInfo>>,
}
struct ClipboardMonitorState {
  last_content: Mutex<Option<String>>,
}
```

#### 2. GPU Monitoring

Uses `nvml-wrapper` crate for NVIDIA GPU monitoring: (Future implementation)

- Temperature monitoring
- Memory utilization tracking
- GPU utilization rates
- Background polling every 2 seconds

#### 3. Window Monitoring

Uses `active-win-pos-rs` crate for active window detection: (Future implementation)

- Window title extraction
- Process name identification
- Activity categorization (CODING, GAMING, BROWSING, OTHER)
- Background polling every 1 second

#### 4. Clipboard Monitoring

Uses `arboard` crate: (Future implementation)

- Event-driven clipboard monitoring
- Content filtering (10-1000 characters)
- Duplicate content detection

#### 5. Global Hotkey Handler

Uses `tauri-plugin-global-shortcut`: (Future implementation)

- Registers Ctrl+Shift+D hotkey
- Toggles click-through state
- Works even when window is in click-through mode

### Data Structures

#### GpuStats

```rust
#[derive(Serialize, Deserialize, Clone)]
struct GpuStats {
  temperature: u32,
  memory_used: u64,
  memory_total: u64,
  utilization: u32,
}
```

*Future implementation*

#### WindowInfo

```rust
#[derive(Serialize, Deserialize, Clone)]
struct WindowInfo {
  title: String,
  process_name: String,
  category: String,
}
```

*Future implementation*

#### Ollama Integration

```rust
#[derive(Serialize, Deserialize)]
struct OllamaRequest {
  model: String,
  prompt: String,
  system: String,
  stream: bool,
}
```

*Future implementation*

#### WindowInfo

```rust
#[derive(Serialize, Deserialize, Clone)]
struct WindowInfo {
  title: String,
  process_name: String,
  category: String,
}
```

#### Ollama Integration

```rust
#[derive(Serialize, Deserialize)]
struct OllamaRequest {
  model: String,
  prompt: String,
  system: String,
  stream: bool,
}

#[derive(Serialize, Deserialize)]
struct OllamaResponse {
  response: String,
}
```

## Frontend Implementation (React/TypeScript)

### Component Structure

#### App Component

Main application component that:

- Integrates all sub-components
- Handles basic UI interactions
- Displays a greeting message

#### SpriteAnimator Component

Responsible for:

- Cycling through animation frames
- Managing frame rates
- Rendering images with proper styling

#### spriteStore Store

Zustand store that:

- Manages ethereal state
- Handles state persistence
- Provides state update functions

### State Management

Uses Zustand for state management:

```typescript
type EtherealState = 'IDLE' | 'CODING' | 'OVERHEATING' | 'GAMING';

interface State {
  state: EtherealState;
  temperature: number;
  position: { x: number; y: number };
  
  setState: (state: EtherealState) => void;
  updateTemp: (temp: number) => void;
}
```

### Animation Configuration

Defined in `src/config/animations.ts`: (Future implementation)

```typescript
export const ANIMATIONS = {
  IDLE: {
    frames: ['/sprites/idle_01.png', '/sprites/idle_02.png'],
    fps: 4,
  },
  // ... other states
}
```

## Communication Layer

### Backend Commands

Exposed through Tauri's IPC system:

1. `greet(name: string) -> String`
2. `set_click_through(window: Window, enabled: bool) -> Result<(), String>` (Future implementation)
3. `get_gpu_stats() -> Result<GpuStats, String>` (Future implementation)
4. `chat_with_ethereal(message: String) -> Result<String, String>` (Future implementation)

### Event System

Backend emits events that frontend listens to: (Future implementation)

1. `gpu-update`: GPU statistics updates
2. `window-update`: Active window changes
3. `clipboard-changed`: Clipboard content changes

## Performance Considerations

### Threading Model

- Main thread: UI and event handling
- Background threads: (Future implementation)
    - GPU monitoring (2-second intervals)
    - Window monitoring (1-second intervals)
    - Clipboard monitoring (event-driven)

### Memory Management

- Uses Rust's ownership system for safe memory management
- Mutex guards for shared state
- Cloning minimized through careful design

### Resource Usage

- Polling intervals optimized for balance between responsiveness and resource usage (Future implementation)
- Event-driven clipboard monitoring reduces overhead (Future implementation)
- Lazy initialization of expensive resources

## Security Considerations

### Permissions

The application requires several permissions: (Future implementation)

- Window management (for overlay functionality)
- GPU monitoring (for NVIDIA libraries)
- Clipboard access (for contextual awareness)
- Network access (for Ollama integration)

### Data Handling

- All data processing happens locally
- No data transmission to external servers by default
- Clipboard content filtering to prevent processing sensitive data (Future implementation)

## Extensibility Points

### Adding New States

1. Extend `EtherealState` type
2. Add animation configuration (Future implementation)
3. Update state machine logic
4. Add categorization logic if needed (Future implementation)

### Adding New Monitors

1. Create new background thread in setup function (Future implementation)
2. Add new state management structure
3. Implement event emission (Future implementation)
4. Add frontend listeners

### Customizing LLM Integration

1. Modify system prompt in `chat_with_ethereal` command (Future implementation)
2. Add new parameters to request structure
3. Implement new response handling

## Testing Strategy

### Unit Testing

- Rust unit tests for backend logic
- Vitest tests for frontend components
- Mocked IPC calls for integration testing

### Integration Testing

- End-to-end tests for core workflows (Future implementation)
- Cross-platform compatibility testing
- Performance benchmarking

### Manual Testing

- Visual verification of animations (Future implementation)
- Hotkey responsiveness testing (Future implementation)
- State transition validation (Future implementation)

## Build and Deployment

### Build Process

1. Frontend transpilation with Vite
2. Rust compilation with Cargo
3. Tauri bundling for target platforms

### Dependencies

#### Rust Dependencies

- `serde`: Serialization/deserialization
- `tauri`: Core framework
- `tokio`: Async runtime
- `tracing`: Logging framework
- `tauri-plugin-opener`: Tauri plugin for opening URLs

#### Node.js Dependencies

- `react`: UI library
- `@tauri-apps/api`: Tauri frontend API
- `@tauri-apps/cli`: Build tools
- `typescript`: Type checking
- `zustand`: State management
- `framer-motion`: Animation library

## Troubleshooting Guide

### Debugging Backend Issues

1. Check Rust compiler errors
2. Verify system library availability
3. Examine Tauri logs
4. Test individual components in isolation

### Debugging Frontend Issues

1. Use browser DevTools
2. Check console for JavaScript errors
3. Verify IPC communication
4. Test component rendering independently

### Performance Profiling

1. Use system monitoring tools
2. Profile Rust threads
3. Monitor memory usage patterns
4. Optimize polling intervals if needed (Future implementation)

## Future Enhancements

### Planned Features

1. Enhanced LLM integration with context awareness
2. Additional monitoring capabilities (CPU, disk, network)
3. Plugin system for extending functionality
4. Cross-platform support improvements
5. Configuration UI for customization
6. Animation editor for creating custom sprites
7. Sound effects synchronized with animations
8. Multi-monitor support
9. User-defined hotkeys
10. Export/import of configurations

### Potential Optimizations

1. WebGPU acceleration for animations
2. More efficient polling algorithms
3. Better resource caching
4. Reduced memory footprint
5. Improved battery usage on laptops
