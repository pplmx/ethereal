# IPC Communication Testing Guide

This guide covers testing patterns for IPC (Inter-Process Communication) in the Desktop Ethereal Tauri backend.

## Understanding Tauri IPC

Tauri uses IPC for communication between the frontend (TypeScript) and backend (Rust):

- **Commands**: Rust functions callable from frontend
- **Events**: Asynchronous messages sent between frontend and backend
- **State**: Shared state management between frontend and backend

## Testing Tauri Commands

### Command Handler Testing

Test command handlers with mock Tauri contexts:

```rust
// In src-tauri/src/commands.rs

#[tauri::command]
pub fn set_click_through(window: tauri::Window, enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::WindowsAndMessaging::*;

        let hwnd = HWND(window.hwnd().map_err(|e| e.to_string())?.0 as isize);

        // Get current extended style
        let ex_style = unsafe { GetWindowLongW(hwnd, GWL_EXSTYLE) };

        // Modify the style based on the enabled parameter
        let new_ex_style = if enabled {
            ex_style | WS_EX_TRANSPARENT.0 as i32
        } else {
            ex_style & !(WS_EX_TRANSPARENT.0 as i32)
        };

        // Apply the new style
        unsafe {
            SetWindowLongW(hwnd, GWL_EXSTYLE, new_ex_style);
            RedrawWindow(hwnd, None, HRGN::default(), RDW_FRAME | RDW_UPDATENOW | RDW_INVALIDATE);
        }

        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Click-through only supported on Windows".to_string())
    }
}

#[cfg(test)]
mod command_tests {
    use super::*;
    use tauri::{test::mock_builder, Manager, test::mock_invoke};

    #[test]
    fn test_set_click_through_command() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![set_click_through])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        let window = app.get_window("main").unwrap();

        // Act
        let result = set_click_through(window, true);

        // Assert
        // On non-Windows platforms, this should return an error
        #[cfg(not(target_os = "windows"))]
        assert!(result.is_err());

        #[cfg(target_os = "windows")]
        assert!(result.is_ok());
    }
}
```

### Async Command Testing

Test async commands with Tauri context:

```rust
#[tauri::command]
pub async fn chat_with_ethereal(message: String) -> Result<String, String> {
    if message.is_empty() {
        return Err("Message cannot be empty".to_string());
    }

    // Simulate async LLM call
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    Ok(format!("Ethereal response to: {}", message))
}

#[cfg(test)]
mod async_command_tests {
    use super::*;
    use tauri::{test::mock_builder, test::mock_invoke};

    #[tokio::test]
    async fn test_chat_with_ethereal_command() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![chat_with_ethereal])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        let result = mock_invoke(&app, "chat_with_ethereal", serde_json::json!({
            "message": "Hello Ethereal!"
        })).await;

        // Assert
        assert!(result.is_ok());
        let response: String = result.unwrap();
        assert!(response.contains("Ethereal response to: Hello Ethereal!"));
    }

    #[tokio::test]
    async fn test_chat_with_ethereal_empty_message() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![chat_with_ethereal])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        let result = mock_invoke(&app, "chat_with_ethereal", serde_json::json!({
            "message": ""
        })).await;

        // Assert
        assert!(result.is_err());
        let error: String = result.unwrap_err();
        assert_eq!(error, "Message cannot be empty");
    }
}
```

## Testing Event Emission

### Emitting Events from Backend

Test that backend functions emit events correctly:

```rust
// In src-tauri/src/monitor.rs

#[tauri::command]
pub fn start_monitoring(app_handle: tauri::AppHandle) -> Result<(), String> {
    tauri::async_runtime::spawn(async move {
        loop {
            // Simulate getting GPU stats
            let gpu_stats = GpuStats {
                temperature: 75,
                utilization: 30,
                memory_used: 1024,
                memory_total: 2048,
            };

            // Emit event to frontend
            app_handle.emit("gpu-update", gpu_stats).unwrap();

            // Wait before next update
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        }
    });

    Ok(())
}

#[cfg(test)]
mod event_tests {
    use super::*;
    use tauri::{test::mock_builder, Manager};
    use std::sync::{Arc, Mutex};

    #[test]
    fn test_start_monitoring_emits_events() {
        // Arrange
        let emitted_events = Arc::new(Mutex::new(Vec::new()));
        let emitted_events_clone = emitted_events.clone();

        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![start_monitoring])
            .setup(move |app| {
                let app_handle = app.handle().clone();
                let emitted_events = emitted_events_clone.clone();

                // Listen for emitted events
                app.listen_any("gpu-update", move |event| {
                    let mut events = emitted_events.lock().unwrap();
                    events.push(event.payload().unwrap().to_string());
                });

                Ok(())
            })
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        let result = start_monitoring(app.handle().clone());

        // Assert
        assert!(result.is_ok());

        // Note: In a real test, you might need to wait for events
        // This is a simplified example
    }
}
```

### Listening for Events in Backend

Test backend event listeners:

```rust
// In src-tauri/src/event_handlers.rs

pub fn setup_event_handlers(app: &mut tauri::App) {
    let app_handle = app.handle().clone();

    // Listen for clipboard events from frontend
    app.listen_any("clipboard-changed", move |event| {
        let content = event.payload().unwrap_or("");
        println!("Clipboard content changed: {}", content);

        // Process clipboard content
        process_clipboard_content(content, &app_handle);
    });
}

fn process_clipboard_content(content: &str, app_handle: &tauri::AppHandle) {
    // Process the clipboard content
    if content.len() > 10 && content.len() < 1000 {
        // Emit processed event
        app_handle.emit("clipboard-processed", content).unwrap();
    }
}

#[cfg(test)]
mod event_listener_tests {
    use super::*;
    use tauri::test::mock_builder;
    use std::sync::{Arc, Mutex};

    #[test]
    fn test_clipboard_event_processing() {
        // Arrange
        let processed_content = Arc::new(Mutex::new(String::new()));
        let processed_content_clone = processed_content.clone();

        let app = mock_builder()
            .setup(move |app| {
                setup_event_handlers(app);

                // Listen for processed events
                let processed_content = processed_content_clone.clone();
                app.listen_any("clipboard-processed", move |event| {
                    let mut content = processed_content.lock().unwrap();
                    *content = event.payload().unwrap_or("").to_string();
                });

                Ok(())
            })
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        // Emit a clipboard-changed event
        app.emit("clipboard-changed", "Test clipboard content").unwrap();

        // Give some time for processing
        std::thread::sleep(std::time::Duration::from_millis(100));

        // Assert
        let content = processed_content.lock().unwrap();
        assert_eq!(*content, "Test clipboard content");
    }
}
```

## Testing State Management

### Shared State Testing

Test Tauri managed state:

```rust
// In src-tauri/src/state.rs

pub struct EtherealState {
    pub current_mode: Mutex<String>,
    pub gpu_temp: Mutex<u32>,
}

#[tauri::command]
pub fn get_current_mode(state: tauri::State<EtherealState>) -> Result<String, String> {
    let mode = state.current_mode.lock().unwrap();
    Ok(mode.clone())
}

#[tauri::command]
pub fn set_current_mode(
    state: tauri::State<EtherealState>,
    mode: String,
) -> Result<(), String> {
    let mut current_mode = state.current_mode.lock().unwrap();
    *current_mode = mode;
    Ok(())
}

#[cfg(test)]
mod state_tests {
    use super::*;
    use tauri::test::mock_builder;
    use tauri::test::mock_invoke;

    #[test]
    fn test_ethereal_state_commands() {
        // Arrange
        let app = mock_builder()
            .manage(EtherealState {
                current_mode: Mutex::new("IDLE".to_string()),
                gpu_temp: Mutex::new(0),
            })
            .invoke_handler(tauri::generate_handler![get_current_mode, set_current_mode])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act & Assert - Get initial mode
        let result = mock_invoke(&app, "get_current_mode", serde_json::Value::Null).await;
        assert!(result.is_ok());
        let mode: String = result.unwrap();
        assert_eq!(mode, "IDLE");

        // Act & Assert - Set new mode
        let result = mock_invoke(&app, "set_current_mode", serde_json::json!({
            "mode": "GAMING"
        })).await;
        assert!(result.is_ok());

        // Act & Assert - Get updated mode
        let result = mock_invoke(&app, "get_current_mode", serde_json::Value::Null).await;
        assert!(result.is_ok());
        let mode: String = result.unwrap();
        assert_eq!(mode, "GAMING");
    }
}
```

## Integration Testing with IPC

### Full IPC Flow Testing

Test complete frontend-to-backend communication flows:

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tauri::{test::mock_builder, test::mock_invoke};
    use std::sync::{Arc, Mutex};

    #[tokio::test]
    async fn test_complete_ipc_flow() {
        // Arrange
        let app = mock_builder()
            .manage(EtherealState {
                current_mode: Mutex::new("IDLE".to_string()),
                gpu_temp: Mutex::new(0),
            })
            .invoke_handler(tauri::generate_handler![
                get_current_mode,
                set_current_mode,
                set_click_through,
                chat_with_ethereal
            ])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act & Assert - Test state management
        let mode: String = mock_invoke(&app, "get_current_mode", serde_json::Value::Null).await.unwrap();
        assert_eq!(mode, "IDLE");

        mock_invoke(&app, "set_current_mode", serde_json::json!({
            "mode": "CODING"
        })).await.unwrap();

        let mode: String = mock_invoke(&app, "get_current_mode", serde_json::Value::Null).await.unwrap();
        assert_eq!(mode, "CODING");

        // Act & Assert - Test async command
        let response: String = mock_invoke(&app, "chat_with_ethereal", serde_json::json!({
            "message": "What are you doing?"
        })).await.unwrap();
        assert!(response.contains("Ethereal response to: What are you doing?"));
    }
}
```

## Best Practices for IPC Testing

1. **Use Tauri's testing utilities**: `mock_builder`, `mock_invoke`, `mock_app`
2. **Test both directions**: Commands (frontend→backend) and events (backend→frontend)
3. **Mock external dependencies**: Use conditional compilation for system-specific code
4. **Test error conditions**: Verify proper error handling in IPC calls
5. **Test state management**: Ensure shared state works correctly across IPC calls
6. **Use realistic payloads**: Test with data that resembles real-world usage
7. **Test concurrency**: Verify that concurrent IPC calls work correctly
8. **Clean up event listeners**: Remove listeners between tests to prevent interference

## Common Testing Patterns

### Event Listener Registration

```rust
#[cfg(test)]
mod event_pattern_tests {
    use super::*;
    use tauri::test::mock_builder;
    use std::sync::{Arc, Mutex};

    #[test]
    fn test_event_listener_pattern() {
        // Arrange - Set up event tracking
        let events_received = Arc::new(Mutex::new(Vec::new()));
        let events_received_clone = events_received.clone();

        let app = mock_builder()
            .setup(move |app| {
                // Register event listener
                let events_received = events_received_clone.clone();
                app.listen_any("test-event", move |event| {
                    let mut events = events_received.lock().unwrap();
                    events.push(event.payload().unwrap_or("").to_string());
                });
                Ok(())
            })
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act - Emit events
        app.emit("test-event", "payload1").unwrap();
        app.emit("test-event", "payload2").unwrap();

        // Small delay to allow event processing
        std::thread::sleep(std::time::Duration::from_millis(10));

        // Assert - Verify events were received
        let events = events_received.lock().unwrap();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0], "payload1");
        assert_eq!(events[1], "payload2");
    }
}
```

This comprehensive guide provides patterns for testing all aspects of IPC communication in Tauri applications, ensuring robust and reliable frontend-backend integration.
