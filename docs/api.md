# 🔌 Ethereal API Documentation

This document defines the IPC (Inter-Process Communication) interface between the Rust backend and the React frontend.

## Backend Commands (Invoke)

### 🧩 Configuration

- **`get_config`**: Fetches the current `AppConfig`.
- **`update_config(config: AppConfig)`**: Saves and applies new settings.
- **`save_window_position(x: i32, y: i32)`**: Persists current window coordinates.

### 🤖 Intelligence

- **`chat_with_ethereal(message: String, history: Vec<ChatMessage>, system_context: Option<String>, mood: Option<String>)`**:
  Sends a request to Ollama with conversation history and system telemetry.

### 🖥️ Window & Display

- **`set_click_through(enabled: bool)`**: Toggles mouse interaction for the main window.
- **`show_context_menu`**: Triggers the native platform context menu.
- **`get_monitors`**: Returns a list of all detected displays and their properties.
- **`move_to_monitor(index: usize)`**: Centers the spirit on a specific monitor.

### ⚙️ System

- **`set_autostart(enabled: bool)`**: Toggles launch at login.
- **`is_autostart_enabled`**: Checks current OS autostart status.

---

## Backend Events (Listen)

### 📊 Telemetry

- **`gpu-update`**: Emitted every 2 seconds.

  ```typescript
  interface HardwareData {
    temperature: number;
    utilization: number;
    memory_used: number;
    memory_total: number;
    network_rx: number;
    network_tx: number;
    disk_read: number;
    disk_write: number;
    battery_level: number;
    battery_state: string;
    active_window: string;
    state: string; // "Overheating", "HighLoad", etc.
    mood: string;  // "Happy", "Excited", etc.
  }
  ```

### 📋 Clipboard

- **`clipboard-changed`**: Emitted when new relevant text/code is copied.
    - **Payload**: `string`

### 🛠️ Maintenance

- **`config-updated`**: Emitted when the configuration file is modified (either via UI or external edit).
- **`open-settings`**: Triggered by tray or context menu to show the modal.
- **`open-about`**: Shows version information.

---

## Data Structures

### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

### MonitorInfo

```typescript
interface MonitorInfo {
  name: string | null;
  size: [number, number];
  position: [number, number];
  scale_factor: number;
  is_primary: boolean;
}
```

## Error Handling

All commands return a `Result<T, String>`. Catching errors in the frontend is mandatory:

```typescript
try {
  await invoke('update_config', { config: newConfig });
} catch (error) {
  logger.error('Failed to sync settings:', error);
}
```
