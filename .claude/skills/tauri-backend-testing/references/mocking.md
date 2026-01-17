# System Dependency Mocking Guide

This guide covers mocking patterns for system dependencies in Tauri backend tests.

## Understanding System Dependencies

Desktop Ethereal interacts with several system components:

- GPU monitoring (NVML/NVIDIA)
- Window management (Windows API)
- Clipboard monitoring
- File system operations
- Network requests (Ollama API)
- System information (CPU, memory)

## Conditional Compilation for Mocking

Use Rust's conditional compilation to provide different implementations for testing:

```rust
// In src-tauri/src/gpu_monitor.rs

// Real implementation for production
#[cfg(not(test))]
pub fn get_gpu_temperature() -> Result<u32, String> {
    let nvml = nvml_wrapper::Nvml::init().map_err(|e| e.to_string())?;
    let device = nvml.device_by_index(0).map_err(|e| e.to_string())?;
    device.temperature().map_err(|e| e.to_string())
}

// Mock implementation for testing
#[cfg(test)]
pub fn get_gpu_temperature() -> Result<u32, String> {
    // Return a realistic mock value
    Ok(75)
}

// Public function that uses the conditional implementation
pub fn get_gpu_stats() -> Result<GpuStats, String> {
    let temperature = get_gpu_temperature()?;
    Ok(GpuStats {
        temperature,
        // ... other fields with mock values in test mode
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_gpu_stats_with_mock() {
        // This will use the mock implementation
        let result = get_gpu_stats();
        assert!(result.is_ok());
        assert_eq!(result.unwrap().temperature, 75);
    }
}
```

## Mocking External Crates

### Mocking NVML (GPU Monitoring)

```rust
// In src-tauri/src/gpu_monitor.rs

#[cfg(not(test))]
use nvml_wrapper;

#[cfg(test)]
mod mock_nvml {
    pub struct MockNvml;
    pub struct MockDevice;

    #[derive(Debug)]
    pub struct NvmlError(pub String);

    impl std::fmt::Display for NvmlError {
        fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "{}", self.0)
        }
    }

    impl std::error::Error for NvmlError {}

    impl MockNvml {
        pub fn init() -> Result<Self, NvmlError> {
            Ok(MockNvml)
        }

        pub fn device_by_index(&self, _index: u32) -> Result<MockDevice, NvmlError> {
            Ok(MockDevice)
        }
    }

    impl MockDevice {
        pub fn temperature(&self) -> Result<u32, NvmlError> {
            Ok(75) // Mock temperature
        }

        pub fn memory_info(&self) -> Result<nvml_wrapper::device::MemoryInfo, NvmlError> {
            Ok(nvml_wrapper::device::MemoryInfo {
                used: 1024 * 1024 * 1024, // 1GB
                free: 1024 * 1024 * 1024, // 1GB
                total: 2048 * 1024 * 1024, // 2GB
            })
        }
    }
}

#[cfg(test)]
use mock_nvml as nvml_wrapper;
```

### Mocking Windows API

```rust
// In src-tauri/src/window_manager.rs

#[cfg(not(test))]
use windows::Win32::UI::WindowsAndMessaging::*;

#[cfg(test)]
mod mock_windows {
    use std::ptr::null_mut;

    pub type HWND = isize;

    pub const GWL_EXSTYLE: i32 = -20;
    pub const WS_EX_TRANSPARENT: u32 = 0x00000020;

    pub unsafe fn GetWindowLongW(_hwnd: HWND, _nindex: i32) -> i32 {
        0 // Mock return value
    }

    pub unsafe fn SetWindowLongW(_hwnd: HWND, _nindex: i32, dwnewlong: i32) -> i32 {
        dwnewlong // Echo the new value
    }

    pub unsafe fn RedrawWindow(
        _hwnd: HWND,
        _lprcupdate: Option<&()> ,
        _hrgnupdate: usize,
        _flags: u32,
    ) -> bool {
        true // Mock success
    }
}

#[cfg(test)]
use mock_windows::*;
```

## Environment Variable Mocking

Use environment variables to control mock behavior:

```rust
// In src-tauri/src/system_info.rs

pub fn get_system_temperature() -> Result<u32, String> {
    #[cfg(test)]
    {
        // In test mode, check for mock temperature environment variable
        if let Ok(temp_str) = std::env::var("MOCK_GPU_TEMP") {
            return temp_str.parse().map_err(|e| format!("Invalid mock temp: {}", e));
        }
    }

    // Real implementation
    #[cfg(not(test))]
    {
        let nvml = nvml_wrapper::Nvml::init().map_err(|e| e.to_string())?;
        let device = nvml.device_by_index(0).map_err(|e| e.to_string())?;
        device.temperature().map_err(|e| e.to_string())
    }

    // Fallback mock for test mode without env var
    #[cfg(test)]
    Ok(75)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_get_system_temperature_default_mock() {
        // This will use the default mock value
        let temp = get_system_temperature().unwrap();
        assert_eq!(temp, 75);
    }

    #[test]
    fn test_get_system_temperature_env_mock() {
        // Set environment variable for custom mock
        env::set_var("MOCK_GPU_TEMP", "85");

        let temp = get_system_temperature().unwrap();
        assert_eq!(temp, 85);

        // Clean up
        env::remove_var("MOCK_GPU_TEMP");
    }
}
```

## Mocking Network Requests

### Mocking HTTP Client

```rust
// In src-tauri/src/llm_client.rs

#[cfg(not(test))]
use reqwest;

#[cfg(test)]
mod mock_reqwest {
    use serde::{Deserialize, Serialize};

    #[derive(Debug)]
    pub struct Error(String);

    impl std::fmt::Display for Error {
        fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "{}", self.0)
        }
    }

    impl std::error::Error for Error {}

    pub struct Client;

    #[derive(Serialize, Deserialize)]
    pub struct Response {
        pub text: String,
    }

    impl Client {
        pub fn new() -> Self {
            Client
        }

        pub async fn post(&self, _url: &str) -> RequestBuilder {
            RequestBuilder
        }
    }

    pub struct RequestBuilder;

    impl RequestBuilder {
        pub fn json<T>(self, _json: &T) -> Self {
            self
        }

        pub async fn send(self) -> Result<MockResponse, Error> {
            Ok(MockResponse)
        }
    }

    pub struct MockResponse;

    impl MockResponse {
        pub async fn json<T>(self) -> Result<T, Error>
        where
            T: for<'de> Deserialize<'de>,
        {
            // Return mock response
            let response = r#"{"response": "Mock LLM response"}"#;
            serde_json::from_str(response).map_err(|e| Error(e.to_string()))
        }
    }
}

#[cfg(test)]
use mock_reqwest as reqwest;
```

## File System Mocking

### Using Temporary Directories

```rust
// In src-tauri/src/config_manager.rs

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::fs;

    #[test]
    fn test_config_save_load() {
        // Create temporary directory
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("config.json");

        // Test saving config
        let config = AppConfig {
            // ... config data
        };

        let result = save_config(&config, &config_path);
        assert!(result.is_ok());

        // Test loading config
        let loaded_config = load_config(&config_path);
        assert!(loaded_config.is_ok());
        // ... assertions on loaded config

        // TempDir automatically cleaned up when dropped
    }
}
```

## Time-Related Mocking

### Mocking Time for Testing

```rust
// In src-tauri/src/timer.rs

#[cfg(not(test))]
use std::time::Instant;

#[cfg(test)]
mod mock_time {
    use std::cell::Cell;
    use std::collections::HashMap;

    thread_local! {
        static MOCK_TIME: Cell<u64> = Cell::new(0);
    }

    pub struct Instant;

    impl Instant {
        pub fn now() -> Self {
            Instant
        }

        pub fn elapsed(&self) -> std::time::Duration {
            let current = MOCK_TIME.with(|time| time.get());
            std::time::Duration::from_millis(current)
        }
    }

    pub fn advance_mock_time(ms: u64) {
        MOCK_TIME.with(|time| {
            let current = time.get();
            time.set(current + ms);
        });
    }
}

#[cfg(test)]
use mock_time::*;

// Function that uses time
pub fn measure_execution_time<F, R>(f: F) -> (R, std::time::Duration)
where
    F: FnOnce() -> R,
{
    let start = Instant::now();
    let result = f();
    let duration = start.elapsed();
    (result, duration)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_measure_execution_time() {
        // Advance mock time
        advance_mock_time(100);

        let (result, duration) = measure_execution_time(|| {
            advance_mock_time(50); // Simulate 50ms of work
            42
        });

        assert_eq!(result, 42);
        assert_eq!(duration.as_millis(), 50);
    }
}
```

## Best Practices for System Mocking

1. **Use conditional compilation**: `#[cfg(test)]` vs `#[cfg(not(test))]`
2. **Provide realistic mock values**: Mocks should return plausible data
3. **Keep mocks simple**: Complex mocks can introduce bugs in tests
4. **Test both real and mock paths**: Ensure both implementations work
5. **Use environment variables for flexibility**: Allow runtime control of mocks
6. **Clean up mock state**: Reset mocks between tests when necessary
7. **Document mock behavior**: Make it clear what the mocks do
8. **Test edge cases with mocks**: Use mocks to simulate error conditions
