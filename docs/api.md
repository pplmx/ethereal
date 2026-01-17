# API Documentation

This document describes the API endpoints and functions available in Desktop Ethereal.

## Backend Commands (Rust)

These commands are exposed by the Rust backend and can be called from the frontend using Tauri's IPC system.

### greet

Simple greeting function for testing IPC connectivity.

**Signature:**
```rust
fn greet(name: &str) -> String
```

**Parameters:**
- `name`: A string to include in the greeting

**Returns:**
- A greeting string: `"Hello, {name}! You've been greeted from Rust!"`

**Example:**
```typescript
import { invoke } from '@tauri-apps/api/core';

const greeting = await invoke('greet', { name: 'User' });
console.log(greeting); // "Hello, User! You've been greeted from Rust!"
```

### set_click_through

Enables or disables click-through mode for the main window. (Future implementation)

**Signature:**
```rust
fn set_click_through(window: tauri::Window, enabled: bool) -> Result<(), String>
```

**Parameters:**
- `window`: The Tauri window object
- `enabled`: Boolean indicating whether to enable or disable click-through

**Returns:**
- `Ok(())` on success
- `Err(String)` with error message on failure

**Example:**
```typescript
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();
await invoke('set_click_through', { window: appWindow, enabled: true });
```

### get_gpu_stats

Retrieves the latest cached GPU statistics. (Future implementation)

**Signature:**
```rust
fn get_gpu_stats(state: tauri::State<GpuMonitorState>) -> Result<GpuStats, String>
```

**Parameters:**
- `state`: Tauri-managed state containing cached GPU stats

**Returns:**
- `Ok(GpuStats)` with current GPU statistics
- `Err(String)` with error message on failure

**GpuStats Structure:**
```rust
struct GpuStats {
  temperature: u32,     // Temperature in Celsius
  memory_used: u64,     // Used memory in bytes
  memory_total: u64,    // Total memory in bytes
  utilization: u32,     // GPU utilization percentage
}
```

**Example:**
```typescript
import { invoke } from '@tauri-apps/api/core';

const gpuStats = await invoke<GpuStats>('get_gpu_stats');
console.log(`GPU Temp: ${gpuStats.temperature}°C`);
```

### chat_with_ethereal

Sends a message to the Ollama LLM and returns the ethereal's response. (Future implementation)

**Signature:**
```rust
async fn chat_with_ethereal(message: String) -> Result<String, String>
```

**Parameters:**
- `message`: The user's message to send to the LLM

**Returns:**
- `Ok(String)` with the LLM's response
- `Err(String)` with error message on failure

**Example:**
```typescript
import { invoke } from '@tauri-apps/api/core';

const response = await invoke<string>('chat_with_ethereal', {
  message: 'What are you doing?'
});
console.log('Ethereal says:', response);
```

## Events

The backend emits events that the frontend can listen to for real-time updates. (Future implementation)

### gpu-update

Emitted when GPU statistics are updated (every 2 seconds).

**Payload:**
```typescript
interface GpuStats {
  temperature: number;     // Temperature in Celsius
  memory_used: number;     // Used memory in bytes
  memory_total: number;    // Total memory in bytes
  utilization: number;     // GPU utilization percentage
}
```

**Listening:**
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<GpuStats>('gpu-update', (event) => {
  console.log('GPU Update:', event.payload);
});
```

### window-update

Emitted when the active window changes (every 1 second). (Future implementation)

**Payload:**
```typescript
interface WindowInfo {
  title: string;         // Window title
  process_name: string;  // Process name
  category: string;      // Activity category (CODING, GAMING, BROWSING, OTHER)
}
```

**Listening:**
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<WindowInfo>('window-update', (event) => {
  console.log('Window Update:', event.payload);
});
```

### clipboard-changed

Emitted when clipboard content changes (event-driven). (Future implementation)

**Payload:**
```typescript
type ClipboardContent = string;  // The clipboard text content
```

**Listening:**
```typescript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<string>('clipboard-changed', (event) => {
  console.log('Clipboard Changed:', event.payload);
});
```

## Frontend Hooks

### useEtherealState

A custom React hook that manages the ethereal's state based on system events. (Future implementation)

**Signature:**
```typescript
function useEtherealState(): {
  current: 'IDLE' | 'CODING' | 'OVERHEATING' | 'GAMING';
  gpuTemp: number;
  activity: string;
}
```

**Returns:**
- `current`: Current ethereal state
- `gpuTemp`: Current GPU temperature
- `activity`: Current activity category

**Usage:**
```typescript
import { useEtherealState } from './hooks/useEtherealState';

function MyComponent() {
  const { current, gpuTemp, activity } = useEtherealState();

  return (
    <div>
      <p>State: {current}</p>
      <p>Temperature: {gpuTemp}°C</p>
      <p>Activity: {activity}</p>
    </div>
  );
}
```

## Configuration Objects

### ANIMATIONS

Animation configuration mapping states to sprite frames and frame rates. (Future implementation)

**Structure:**
```typescript
const ANIMATIONS = {
  IDLE: {
    frames: string[];  // Array of image paths
    fps: number;       // Frames per second
  },
  CODING: {
    frames: string[];
    fps: number;
  },
  OVERHEATING: {
    frames: string[];
    fps: number;
  },
  GAMING: {
    frames: string[];
    fps: number;
  }
}
```

**Usage:**
```typescript
import { ANIMATIONS } from './config/animations';

const idleAnimation = ANIMATIONS.IDLE;
console.log(idleAnimation.frames); // ['/sprites/idle_01.png', '/sprites/idle_02.png']
console.log(idleAnimation.fps);    // 4
```

## Error Handling

All backend commands return `Result` types in Rust, which translate to Promise resolutions/rejections in TypeScript:

```typescript
try {
  const result = await invoke('some_command', { param: value });
  // Handle success
} catch (error) {
  // Handle error - error will be a string message
  console.error('Command failed:', error);
}
```

## Type Definitions

### EtherealState

Represents the possible states of the ethereal:

```typescript
type EtherealState = 'IDLE' | 'CODING' | 'OVERHEATING' | 'GAMING';
```

### ActivityCategory

Represents the possible activity categories:

```typescript
type ActivityCategory = 'CODING' | 'BROWSING' | 'GAMING' | 'OTHER';
```

## Constants

### Default Values

- **GPU Update Interval**: 2 seconds (Future implementation)
- **Window Update Interval**: 1 second (Future implementation)
- **Temperature Threshold**: 80°C for OVERHEATING state (Future implementation)
- **Clipboard Content Filters**: 10-1000 characters (Future implementation)
- **Default Animation FPS**: 4 FPS for IDLE, varies by state (Future implementation)
- **Hotkey**: Ctrl+Shift+D for toggling click-through (Future implementation)

## Performance Notes

### Update Frequencies

- GPU monitoring: Every 2 seconds (Future implementation)
- Window monitoring: Every 1 second (Future implementation)
- Clipboard monitoring: Event-driven (no polling) (Future implementation)

### Memory Considerations

- GPU stats cached in memory (Future implementation)
- Last window info cached in memory (Future implementation)
- Clipboard content deduplicated to prevent excessive events (Future implementation)
- Animation frames loaded on-demand by browser (Future implementation)

### Threading

- Main UI thread for frontend
- Main event loop for backend
- Separate threads for:
  - GPU monitoring (Future implementation)
  - Window monitoring (Future implementation)
  - Clipboard monitoring (Future implementation)

## Security

### Data Privacy

- All data remains local to the user's machine
- No data is transmitted over the network except:
  - Ollama API calls (local only by default) (Future implementation)
  - Update checks (if implemented in future) (Future implementation)

### Permissions

The application requires the following permissions:
- Window management (essential for overlay functionality) (Future implementation)
- GPU monitoring (essential for temperature-based features) (Future implementation)
- Clipboard access (essential for contextual awareness) (Future implementation)
- Network access (for Ollama integration) (Future implementation)

## Extending the API

### Adding New Commands

1. Create a new function annotated with `#[tauri::command]`
2. Add it to the `invoke_handler` in `lib.rs`
3. Export it in the frontend through a helper function

### Adding New Events

1. Emit the event using `app_handle.emit()` (Future implementation)
2. Listen to it in the frontend using `listen()`
3. Update TypeScript types as needed

### Adding New State

1. Add new fields to appropriate state structs (Future implementation)
2. Update serialization/deserialization code
3. Modify frontend types and hooks as needed
