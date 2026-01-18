# Technical Documentation

This document provides detailed technical information about the Desktop Ethereal implementation.

## Architecture Overview

Desktop Ethereal follows a frontend-backend architecture using Tauri:

- **Frontend**: React 19 with TypeScript, Zustand for state management, and Framer Motion for animations.
- **Backend**: Rust using the Tauri 2.0 framework for system-level operations and background monitoring.
- **Communication**: Tauri's IPC (Inter-Process Communication) system via Commands and Events.

### Component Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Sprite    │  │ spriteStore  │  │   settingsStore    │ │
│  │ Animator    │  │    Store     │  │      Store         │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Event Listeners                       ││
│  │  GPU/HW Updates ◄──┐ Config Change ◄──┐ Clipboard ◄──┐  ││
│  └────────────────────┼───────────────────┼─────────────────┘│
└───────────────────────┼───────────────────┼──────────────────┘
                        ▼                   ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend (Rust)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ HW Monitors │  │ Window Watch │  │ Clipboard Monitor  │ │
│  │ (CPU/Net/..)│  │    Thread    │  │      Thread        │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Command Handlers                     ││
│  │  get_config   update_config   show_context_menu         ││
│  │  get_monitors move_to_monitor chat_with_ethereal        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Backend Implementation (Rust)

### Core Modules

#### 1. Configuration Management (`config.rs`)

- Uses `serde` for serialization.
- Persists data to `ethereal.toml` in the app's config directory.
- Features: Automatic reloading on file change via `notify-debouncer-mini` and dynamic hotkey re-registration.

#### 2. System Perception (`monitors/`)

- **Hardware Monitoring**: Uses `sysinfo` to track CPU usage, memory pressure, and per-process disk I/O.
- **Network Monitoring**: Custom calculation of global RX/TX rates.
- **Battery Status**: Uses `battery` crate for laptop battery level and state.
- **Window Monitoring**: Uses `active-win-pos-rs` to categorize the active application (CODING, GAMING, etc.).
- **Clipboard Monitoring**: Polling via `arboard` with content filtering.

#### 3. Intelligence Layer (`ai/`)

- Simple Ollama API client for local LLM inference.
- Dynamically injected system context based on current hardware/emotional state.
- Supports user-defined system prompts and mood-specific personality modifiers.

#### 4. UI Utilities (`utils/`)

- **Display**: Enumeration and window placement across multiple monitors.
- **Global Hotkeys**: Dynamic registration of user-defined shortcuts (Toggle Click-through, Quit).
- **Notifications**: Integrated system tray and desktop notifications for critical states (Overheating, Low Battery).

### Data Structures

#### GpuStats (Backend -> Frontend Event)

```rust
struct GpuStats {
    temperature: f32,
    utilization: f32,
    memory_used: u64,
    memory_total: u64,
    network_rx: u64,
    network_tx: u64,
    disk_read: u64,
    disk_write: u64,
    battery_level: f32,
    battery_state: String,
    state: String,
    mood: String,
}
```

## Frontend Implementation (React)

### State Management (Zustand)

- **`useSpriteStore`**: Tracks character state, mood, and hardware stats history. Handles dynamic FPS calculation based on mood.
- **`useSettingsStore`**: Manages the configuration lifecycle and UI visibility.
- **`useChatStore`**: Controls the speech bubble and thinking states.
- **`useResourceStore`**: Handles asynchronous asset preloading for sprites and sounds.

### Key Components

- **`SpriteAnimator`**: Performance-optimized loop using `requestAnimationFrame`.
- **`StateOverlay`**: Minimalist UI displaying current character state and mood emoji.
- **`SpeechBubble`**: Interactive AI response UI with `AnimatePresence`.
- **`SettingsModal`**: Multi-tab configuration interface for full control (Window, HW, AI, Sound, Sprite, Hotkeys, Notifications, Sleep).

## Character Logic

### State Machine

The Sprite's state is determined by a priority-based logic:

1. `Overheating`: High hardware temperature.
2. `Sleeping`: Scheduled time-based inactivity.
3. `LowBattery`: Critical power state (< 20%).
4. `HighLoad`: High CPU (> 80%), Memory (> 90%), or Disk (> 10MB/s) activity.
5. Activity based: `Gaming`, `Working` (Coding), or `Browsing`.
6. `Idle`: Default fallback.

### Mood System

Derived from current state and historical activity:

- `Angry`: Triggered by `Overheating` or extreme `HighLoad`.
- `Sad`: Triggered by `LowBattery` state.
- `Tired`: Extended `HighLoad` periods.
- `Excited`: High activity in `Gaming`/`Working` states.
- `Bored`: Long periods in `Idle` or `Sleeping`.
- `Happy`: Standard healthy operation.

## Testing Strategy

### Integration Tests

We emphasize end-to-end feature verification:

- `ChatFlow`: Clipboard -> Backend AI -> Frontend UI.
- `SettingsFlow`: UI Interaction -> Persistence -> Backend Reaction.
- `SystemMonitor`: Backend Event -> Store Sync -> UI Dashboard.
- `CharacterInteraction`: Click events -> AI/Menu triggers.

### Rust Unit Tests

- State machine logic (`state_test.rs`).
- Configuration parsing (`config_test.rs`).
- Window categorization (`window.rs`).
- Mock data generation (`mock_test.rs`).
