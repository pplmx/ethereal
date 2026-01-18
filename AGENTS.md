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
    - `ResizeObserver` & `IntersectionObserver`: Mock in `setup.ts`.
- **Mocking Modules**:
    - Use `vi.mock('@path/to/module', () => ({ ... }))` at the top of the test file.
    - For store mocks, ensure you reset state in `beforeEach`.

### 1.3 Backend Testing (Rust)

- Use standard `#[cfg(test)]` modules.
- For logic involving system calls (like `sysinfo`), implement Traits (e.g., `HardwareMonitor`) and mock the implementation for tests.
- **Thread Safety**: Some crates (like `battery`) are not `Send/Sync` on all platforms. Do not store them in long-lived state if they need to move between threads; create fresh instances or use platform-specific guards.

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
- **No `any`**: TypeScript `any` is strictly forbidden. Use `unknown` or specific interfaces.
- **Error Handling**:
    - Backend: Return `Result<T, String>` for all Tauri commands.
    - Frontend: Wrap async calls in `try/catch` and log errors via `logger` (not `console`).

## 4. AI Agent Persona ("Ethereal")

When implementing AI features:

- **System Prompt**: "You are Ethereal, a digital spirit living in the code..."
- **Tone**: Witty, concise (< 30 words), slightly mysterious, but professional when discussing code.
- **Context**: Always inject system context (Current State, Mood, Hardware Metrics) into prompts.

## 5. Development Workflow

### 5.1 Package Management

- **PNPM Only**: This project strictly uses `pnpm`. `npm` and `yarn` are blocked via `preinstall` hooks.
- **Corepack**: Recommended for managing `pnpm` versions.

### 5.2 Git Standards
- **Conventional Commits**: All commits must follow the `type(scope): description` format.
- **Commit Body**: 
    - Lines in the commit body must not exceed 100 characters to pass linting hooks.
    - Content should accurately reflect the actual changes made.
    - Avoid over-redundancy while remaining detailed enough for significant changes.
    - It is not strictly mandatory to follow categories if they don't fit; focus on clarity and accuracy.
- **Atomic Commits**: Commit each complete feature or fix separately.


### 5.3 Asset Management

- **Placeholders**: For development without final assets, use the `pnpm generate:assets` script to create SVG sprites and silent MP3s.
- **Extensions**: Prefer `.svg` for placeholders and `.png` for final production sprites.

## 6. Troubleshooting Common Issues

### "Test timed out" in Vitest

- **Cause**: `vi.advanceTimersByTime` not wrapped in `act`, or component waiting for a promise that never resolves.
- **Fix**: Ensure all async effects are mocked or controlled. Use `await act(...)`.

### "window.Audio is not a constructor"

- **Cause**: Invalid mock setup.
- **Fix**:

  ```typescript
  const AudioMock = vi.fn().mockImplementation(() => ({ play: vi.fn(), ... }));
  window.Audio = AudioMock as any;
  ```

### "Zustand persist not working in tests"

- **Cause**: `localStorage` is missing in JSDOM.
- **Fix**: Mock `localStorage` in `setup.ts`.
