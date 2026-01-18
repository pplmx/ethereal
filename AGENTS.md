# Agent Guidelines & Development Standards

This document outlines the strict guidelines, patterns, and protocols that all AI Agents (and human developers) must follow when contributing to the **Ethereal** codebase.

## 1. Testing Protocol (CRITICAL)

Testing is not optional. It is the primary verification mechanism for this project.

### 1.1 Integration vs. Unit

- **Prioritize Integration Tests**: For features involving multiple systems (e.g., `ChatFlow` involves User Input -> Backend -> AI -> Store -> UI), always write an integration test first.
- **Location**:
    - Unit tests: `src/__tests__/unit/` or next to source files.
    - Integration tests: `src/__tests__/integration/`.

### 1.2 Frontend Testing (Vitest + RTL)

- **Time-Dependent Tests**:
    - Always use `vi.useFakeTimers({ shouldAdvanceTime: true })` when testing animations or intervals.
    - Use `await act(async () => { vi.advanceTimersByTime(ms) })` to ensure React state updates flush correctly after time advances.
    - **NEVER** write infinite wait loops. Use `waitFor` with explicit expectations.
- **Mocking Globals**:
    - `window.Audio`: Use `vi.stubGlobal('Audio', ...)` or assign to `window.Audio` in `beforeEach`.
    - **Important**: Mock the *constructor* to return an object with `play`, `pause`, etc.
    - `ResizeObserver`: Mock in `setup.ts`.
- **Mocking Modules**:
    - Use `vi.mock('@path/to/module', () => ({ ... }))` at the top of the test file.
    - For store mocks, ensure you reset state in `beforeEach`.

### 1.3 Backend Testing (Rust)

- Use standard `#[cfg(test)]` modules.
- For logic involving system calls (like `sysinfo`), implement Traits (e.g., `HardwareMonitor`) and mock the implementation for tests.

## 2. Architecture Standards

### 2.1 State Management (Hybrid)

- **Source of Truth**: The Backend (Rust) `AppConfig` is the single source of truth for persistent settings.
- **Frontend State**: Zustand stores (`useSettingsStore`, `useSpriteStore`) mirror the backend state.
- **Syncing**:
    - On Load: Frontend fetches config (`get_config`).
    - On Update: Frontend calls command (`update_config`).
    - On External Change: Backend emits event (`config-updated`) -> Frontend Listener updates Store.

### 2.2 Performance

- **Animations**:
    - **MUST** use `requestAnimationFrame` for visual updates (Sprite animation).
    - **NEVER** use `setInterval` or `setTimeout` for rendering loops.
- **Preloading**:
    - Heavy assets (Frames, Audio) must be preloaded before use.
    - Use `useResourceStore` for tracking load status.

### 2.3 IPC & Events

- **Commands**: snake_case in Rust (`get_config`), camelCase invocation in JS (`invoke('get_config')`).
- **Events**: kebab-case (`gpu-update`, `clipboard-changed`).

## 3. Code Style & Quality

- **Linting**: Run `biome check` and `cargo clippy` before committing.
- **No `any`**: TypeScript `any` is strictly forbidden. Define interfaces in `src/types/`.
- **Error Handling**:
    - Backend: Return `Result<T, String>` for all Tauri commands.
    - Frontend: Wrap async calls in `try/catch` and log errors via `logger` (not `console`).

## 4. AI Agent Persona ("Ethereal")

When implementing AI features:

- **System Prompt**: "You are Ethereal, a digital spirit living in the code..."
- **Tone**: Witty, concise (< 30 words), slightly mysterious, but professional when discussing code.
- **Context**: Always inject system context (Clipboard, Hardware Status) into prompts.

## 5. Troubleshooting Common Issues

### "Test timed out" in Vitest

- **Cause**: `vi.advanceTimersByTime` not wrapped in `act`, or component waiting for a promise that never resolves.
- **Fix**: Ensure all async effects are mocked or controlled. Use `await act(...)`.

### "window.Audio is not a constructor"

- **Cause**: Invalid mock setup.
- **Fix**:

  ```typescript
  const AudioMock = vi.fn().mockImplementation(() => ({ play: vi.fn(), ... }));
  vi.stubGlobal('Audio', AudioMock);
  ```

### "Zustand persist not working in tests"

- **Cause**: `localStorage` is missing in JSDOM.
- **Fix**: Mock `localStorage` in `setup.ts`.
