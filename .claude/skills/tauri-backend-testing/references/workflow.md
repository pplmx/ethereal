# Tauri Backend Testing Workflow Guide

This guide defines the workflow for generating tests for Tauri backend code, especially for complex modules or directories with multiple functions.

## Scope Clarification

When assigned to test a module or directory, test **ALL functions** within that scope:

- Test all public functions in the module
- Test all command handlers if testing Tauri commands
- Test all system integration functions
- Use incremental approach: one function at a time, verify each before proceeding
- Goal: 100% coverage of ALL functions in the module/directory

## Planning Phase

Before writing tests, analyze the target module:

1. **Inventory Functions**: List all public functions that need testing
2. **Categorize Complexity**:
   - Simple (pure functions)
   - Medium (functions with dependencies)
   - Complex (system integration, async operations)
3. **Identify Dependencies**: Note external system calls, Tauri APIs, etc.
4. **Plan Mocking Strategy**: Determine what needs to be mocked

## Implementation Workflow

### Step 1: Start with Simple Functions

Begin with the simplest functions that have no external dependencies:

```rust
// Example of a simple function to test first
pub fn calculate_animation_frame(current_frame: usize, total_frames: usize) -> usize {
    (current_frame + 1) % total_frames
}
```

### Step 2: Progress to Complex Functions

Gradually work up to more complex functions:

```rust
// Example of a complex function to test later
#[tauri::command]
pub async fn monitor_gpu_temperature(app_handle: tauri::AppHandle) -> Result<GpuStats, String> {
    // Complex async operation with system calls
    let nvml = nvml_wrapper::Nvml::init().map_err(|e| e.to_string())?;
    let device = nvml.device_by_index(0).map_err(|e| e.to_string())?;
    let temperature = device.temperature().map_err(|e| e.to_string())?;
    
    Ok(GpuStats { temperature })
}
```

### Step 3: Verify Each Test

For each function, follow this verification process:

1. **Write the test**
2. **Run the test**: `cargo test function_name`
3. **If PASS**: Mark complete, move to next function
4. **If FAIL**: Fix the implementation or test, then retry
5. **Check coverage**: Ensure adequate coverage for the function

## Test Organization

Organize tests in a hierarchical structure:

```rust
#[cfg(test)]
mod tests {
    // Test setup functions
    mod test_helpers {
        // Helper functions for tests
    }
    
    // Unit tests for pure functions
    mod unit_tests {
        // Tests for simple functions
    }
    
    // Integration tests for command handlers
    mod command_tests {
        // Tests for Tauri commands
    }
    
    // System integration tests
    mod integration_tests {
        // Tests for system interactions
    }
}
```

## Incremental Development Process

Use a todo list approach for tracking progress:

1. **List all functions** that need testing
2. **Mark current function** as in progress
3. **Complete test** for current function
4. **Verify test passes**
5. **Move to next function**

Example todo list:

- [ ] `calculate_animation_frame` (simple function)
- [ ] `parse_window_title` (medium function)  
- [ ] `monitor_gpu_temperature` (complex async function)
- [ ] `handle_clipboard_events` (system integration)

## Error Handling

When tests fail:

1. **Don't skip** - Fix the failing test before proceeding
2. **Diagnose** - Determine if the issue is in the implementation or test
3. **Fix** - Correct either the function or the test
4. **Re-run** - Verify the fix resolves the issue
5. **Continue** - Only then proceed to the next function

## Coverage Verification

After testing each function:

1. **Run coverage**: `cargo tarpaulin --out Html`
2. **Check function coverage**: Ensure the target function has 100% coverage
3. **Verify branch coverage**: Ensure all branches are tested
4. **Document gaps**: Note any uncovered edge cases

## Completion Criteria

A module/directory is considered fully tested when:

- ✅ All public functions have tests
- ✅ All tests pass
- ✅ Coverage goals are met for each function
- ✅ Edge cases are handled
- ✅ Error conditions are tested
- ✅ Integration points are verified

## Common Pitfalls to Avoid

1. **Testing implementation details** instead of behavior
2. **Skipping error cases** in favor of happy paths
3. **Writing tests that are too coupled** to implementation
4. **Not mocking external dependencies** properly
5. **Rushing through complex functions** without proper verification

## Best Practices

1. **Write tests first** when possible (TDD approach)
2. **Use descriptive test names** that clearly indicate what is being tested
3. **Keep tests isolated** - each test should be independent
4. **Mock external dependencies** to ensure consistent test results
5. **Test edge cases** - empty inputs, boundary conditions, error conditions
6. **Use setup/teardown functions** to reduce code duplication
7. **Group related tests** in modules for better organization
