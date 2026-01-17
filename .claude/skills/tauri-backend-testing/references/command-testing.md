# Tauri Command Handler Testing Guide

This guide covers testing patterns for Tauri command handlers in the Desktop Ethereal project.

## Understanding Tauri Commands

Tauri commands are Rust functions annotated with `#[tauri::command]` that can be called from the frontend:

```rust
#[tauri::command]
pub fn set_click_through(window: tauri::Window, enabled: bool) -> Result<(), String> {
    // Implementation
}
```

## Testing Command Handlers

### Basic Command Testing

For simple commands with no external dependencies:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::{mock_app, mock_window};

    #[test]
    fn test_simple_command_success() {
        // Arrange
        let app = mock_app();
        let window = mock_window(&app, "main");
        let enabled = true;

        // Act
        let result = set_click_through(window, enabled);

        // Assert
        assert!(result.is_ok());
    }

    #[test]
        fn test_simple_command_error() {
        // Arrange
        let app = mock_app();
        // Invalid window to simulate error condition
        let window = mock_window(&app, "invalid");
        let enabled = true;

        // Act
        let result = set_click_through(window, enabled);

        // Assert
        assert!(result.is_err());
    }
}
```

### Async Command Testing

For async commands, use tokio test runtime:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_command() {
        // Arrange
        let app = mock_app();
        let window = mock_window(&app, "main");
        let message = "test message".to_string();

        // Act
        let result = chat_with_ethereal(window, message).await;

        // Assert
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(!response.is_empty());
    }
}
```

### Command with System Dependencies

For commands that interact with system resources, use mocking:

```rust
// In src-tauri/src/gpu_monitor.rs
#[cfg(not(test))]
fn get_gpu_temperature() -> Result<u32, String> {
    let nvml = nvml_wrapper::Nvml::init().map_err(|e| e.to_string())?;
    let device = nvml.device_by_index(0).map_err(|e| e.to_string())?;
    device.temperature().map_err(|e| e.to_string())
}

#[cfg(test)]
fn get_gpu_temperature() -> Result<u32, String> {
    // Mock implementation for testing
    Ok(75) // Return a realistic temperature value
}

#[tauri::command]
pub fn get_gpu_stats() -> Result<GpuStats, String> {
    let temperature = get_gpu_temperature()?;
    Ok(GpuStats { temperature })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_gpu_stats() {
        // Arrange - get_gpu_temperature() will return mocked value

        // Act
        let result = get_gpu_stats();

        // Assert
        assert!(result.is_ok());
        let stats = result.unwrap();
        assert_eq!(stats.temperature, 75);
    }
}
```

## Testing with Real Tauri Context

For more comprehensive testing, use Tauri's testing utilities:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::{test::mock_builder, Manager};

    #[test]
    fn test_command_with_app_context() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![set_click_through])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        let window = app.get_window("main").unwrap();
        let enabled = true;

        // Act
        let result = set_click_through(window.clone(), enabled);

        // Assert
        assert!(result.is_ok());

        // Additional assertions about side effects
        // (implementation dependent)
    }
}
```

## Error Handling in Command Tests

Always test both success and error paths:

```rust
#[tauri::command]
pub fn validate_input(input: String) -> Result<String, String> {
    if input.is_empty() {
        return Err("Input cannot be empty".to_string());
    }
    if input.len() > 100 {
        return Err("Input too long".to_string());
    }
    Ok(input.to_uppercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_input_success() {
        // Arrange
        let input = "valid input".to_string();

        // Act
        let result = validate_input(input);

        // Assert
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "VALID INPUT");
    }

    #[test]
    fn test_validate_input_empty_error() {
        // Arrange
        let input = "".to_string();

        // Act
        let result = validate_input(input);

        // Assert
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Input cannot be empty");
    }

    #[test]
    fn test_validate_input_length_error() {
        // Arrange
        let input = "a".repeat(101); // 101 characters

        // Act
        let result = validate_input(input);

        // Assert
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Input too long");
    }
}
```

## Integration Testing for Commands

Test command integration with the Tauri framework:

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tauri::{test::mock_builder, Manager, test::mock_invoke};

    #[test]
    fn test_command_invocation() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![set_click_through])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        let result = mock_invoke(&app, "set_click_through", serde_json::json!({
            "enabled": true
        }));

        // Assert
        assert!(result.is_ok());
    }
}
```

## Best Practices for Command Testing

1. **Test all code paths**: Success, error, and edge cases
2. **Use realistic test data**: Mock data should resemble real-world inputs
3. **Isolate tests**: Each test should be independent
4. **Mock external dependencies**: Use conditional compilation for test mocks
5. **Test side effects**: Verify that commands produce expected changes
6. **Use descriptive test names**: Clearly indicate what is being tested
7. **Keep tests fast**: Avoid slow operations in tests when possible
8. **Test error messages**: Ensure error messages are informative
