# Async Operations Testing Guide

This guide covers testing patterns for async operations in the Desktop Ethereal Tauri backend.

## Understanding Async in Tauri

Tauri applications often use async operations for:

- System monitoring (GPU, CPU, memory)
- Network requests (LLM integration)
- File I/O operations
- Event handling
- Background tasks

## Testing Async Functions

### Basic Async Testing

Use `#[tokio::test]` for async tests:

```rust
// Example async function
pub async fn fetch_system_info() -> Result<SystemInfo, String> {
    // Simulate async operation
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    Ok(SystemInfo {
        cpu_count: num_cpus::get(),
        memory_gb: sys_info::mem_info().map(|m| m.total / 1024 / 1024).unwrap_or(0),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_fetch_system_info() {
        // Arrange - no special setup needed

        // Act
        let result = fetch_system_info().await;

        // Assert
        assert!(result.is_ok());
        let info = result.unwrap();
        assert!(info.cpu_count > 0);
        assert!(info.memory_gb > 0);
    }
}
```

### Async with Timeouts

Set timeouts for async operations to prevent hanging tests:

```rust
#[tokio::test]
async fn test_async_operation_with_timeout() {
    // Arrange
    let timeout_duration = tokio::time::Duration::from_secs(5);

    // Act
    let result = tokio::time::timeout(timeout_duration, fetch_system_info()).await;

    // Assert
    assert!(result.is_ok());
    let info = result.unwrap().unwrap();
    assert!(info.cpu_count > 0);
}
```

### Testing Async Error Handling

Always test both success and error paths for async operations:

```rust
pub async fn risky_async_operation(should_fail: bool) -> Result<String, String> {
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

    if should_fail {
        Err("Operation failed".to_string())
    } else {
        Ok("Operation succeeded".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_risky_async_operation_success() {
        // Arrange
        let should_fail = false;

        // Act
        let result = risky_async_operation(should_fail).await;

        // Assert
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Operation succeeded");
    }

    #[tokio::test]
    async fn test_risky_async_operation_failure() {
        // Arrange
        let should_fail = true;

        // Act
        let result = risky_async_operation(should_fail).await;

        // Assert
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Operation failed");
    }
}
```

## Testing Async Tauri Commands

### Async Command with Mocking

For async Tauri commands, mock external dependencies:

```rust
// In src-tauri/src/llm_client.rs
#[cfg(not(test))]
pub async fn call_llm_api(prompt: String) -> Result<String, String> {
    // Real implementation with HTTP request
    let client = reqwest::Client::new();
    // ... actual API call
    Ok("LLM response".to_string())
}

#[cfg(test)]
pub async fn call_llm_api(prompt: String) -> Result<String, String> {
    // Mock implementation for testing
    if prompt.is_empty() {
        Err("Empty prompt".to_string())
    } else {
        Ok(format!("Mock response to: {}", prompt))
    }
}

#[tauri::command]
pub async fn chat_with_ethereal(message: String) -> Result<String, String> {
    if message.is_empty() {
        return Err("Message cannot be empty".to_string());
    }

    call_llm_api(message).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_chat_with_ethereal_success() {
        // Arrange
        let message = "Hello ethereal!".to_string();

        // Act
        let result = chat_with_ethereal(message).await;

        // Assert
        assert!(result.is_ok());
        let response = result.unwrap();
        assert!(response.contains("Mock response to"));
    }

    #[tokio::test]
    async fn test_chat_with_ethereal_empty_message() {
        // Arrange
        let message = "".to_string();

        // Act
        let result = chat_with_ethereal(message).await;

        // Assert
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Message cannot be empty");
    }
}
```

### Async Command with Tauri Context

Test async commands with Tauri application context:

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tauri::{test::mock_builder, Manager, test::mock_invoke};

    #[tokio::test]
    async fn test_async_command_invocation() {
        // Arrange
        let app = mock_builder()
            .invoke_handler(tauri::generate_handler![chat_with_ethereal])
            .build(tauri::test::noop_assets())
            .expect("failed to build app");

        // Act
        let result = mock_invoke(&app, "chat_with_ethereal", serde_json::json!({
            "message": "Test message"
        })).await;

        // Assert
        assert!(result.is_ok());
        let response: String = result.unwrap();
        assert!(response.contains("Mock response to"));
    }
}
```

## Testing Concurrent Async Operations

### Testing Futures

Test concurrent operations using futures:

```rust
use futures::join;

pub async fn monitor_multiple_systems() -> (Result<GpuStats, String>, Result<CpuStats, String>) {
    let gpu_future = get_gpu_stats();
    let cpu_future = get_cpu_stats();

    join!(gpu_future, cpu_future)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_concurrent_monitoring() {
        // Arrange - no special setup needed

        // Act
        let (gpu_result, cpu_result) = monitor_multiple_systems().await;

        // Assert
        assert!(gpu_result.is_ok());
        assert!(cpu_result.is_ok());

        let gpu_stats = gpu_result.unwrap();
        let cpu_stats = cpu_result.unwrap();

        // Verify stats are reasonable
        assert!(gpu_stats.temperature < 100); // Should be reasonable temperature
        assert!(cpu_stats.usage >= 0.0 && cpu_stats.usage <= 100.0);
    }
}
```

### Testing Async Streams

For continuous monitoring, test async streams:

```rust
use tokio_stream::{Stream, StreamExt};

pub fn create_monitoring_stream() -> impl Stream<Item = SystemStats> {
    async_stream::stream! {
        loop {
            yield get_current_system_stats().await;
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_stream::StreamExt;

    #[tokio::test]
    async fn test_monitoring_stream() {
        // Arrange
        let mut stream = create_monitoring_stream();

        // Act - Collect first 3 items
        let mut results = Vec::new();
        for _ in 0..3 {
            if let Some(stats) = stream.next().await {
                results.push(stats);
            }
        }

        // Assert
        assert_eq!(results.len(), 3);
        for stats in results {
            // Verify each stats object is valid
            assert!(stats.timestamp > 0);
        }
    }
}
```

## Best Practices for Async Testing

1. **Use appropriate test attributes**: `#[tokio::test]` for async tests
2. **Set timeouts**: Prevent tests from hanging indefinitely
3. **Test error conditions**: Always test both success and failure paths
4. **Mock external dependencies**: Use conditional compilation for test mocks
5. **Use realistic delays**: When testing timing-dependent code, use appropriate delays
6. **Test concurrent operations**: Verify that concurrent operations work correctly
7. **Verify async cleanup**: Ensure resources are properly cleaned up
8. **Test cancellation**: For long-running operations, test cancellation behavior

## Common Patterns

### Retry Logic Testing

```rust
pub async fn retry_operation<F, Fut, T, E>(
    mut operation: F,
    max_retries: usize,
) -> Result<T, E>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T, E>>,
    E: std::fmt::Display,
{
    let mut retries = 0;
    loop {
        match operation().await {
            Ok(result) => return Ok(result),
            Err(err) => {
                retries += 1;
                if retries >= max_retries {
                    return Err(err);
                }
                tokio::time::sleep(tokio::time::Duration::from_millis(100 * retries as u64)).await;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[tokio::test]
    async fn test_retry_logic_succeeds() {
        // Arrange
        static ATTEMPTS: AtomicUsize = AtomicUsize::new(0);

        let operation = || async {
            let attempt = ATTEMPTS.fetch_add(1, Ordering::SeqCst);
            if attempt < 2 {
                Err("Temporary failure".to_string())
            } else {
                Ok("Success".to_string())
            }
        };

        // Act
        let result = retry_operation(operation, 5).await;

        // Assert
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Success");
        assert_eq!(ATTEMPTS.load(Ordering::SeqCst), 3); // 3 attempts total
    }

    #[tokio::test]
    async fn test_retry_logic_fails() {
        // Arrange
        let operation = || async {
            Err("Permanent failure".to_string())
        };

        // Act
        let result = retry_operation(operation, 3).await;

        // Assert
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Permanent failure");
    }
}
```
