# Agent Guidelines & Development Standards

This document outlines the strict guidelines, patterns, and protocols that all AI Agents (and human developers) must follow when contributing to the **Ethereal** codebase.

## 1. Development Lifecycle: The Golden Loop

Every feature or fix must follow the **Implement -> Verify -> Commit** cycle. A task is NOT complete until all verification steps pass.

### 1.1 Implementation (Vibe Coding)

- Follow existing patterns and architecture standards.
- Write self-documenting code. Use comments only for complex logic (Section 5.2).

### 1.2 Verification (Mandatory Checklist)

Before declaring a task done or creating a commit, the following commands MUST be executed and pass:

| Scope | Command | Purpose |
| :--- | :--- | :--- |
| **Frontend Tests** | `pnpm test:run` | Ensure no regressions in UI/Logic. |
| **Backend Tests** | `pnpm test:rust` | Verify Rust logic and state machine. |
| **Linting (TS)** | `pnpm lint:fix` | Check and fix code style/quality. |
| **Linting (Rust)** | `pnpm lint:rs` | Format and check Rust code via Clippy. |
| **Linting (MD)** | `pnpm lint:md` | Check Markdown formatting. |
| **Type Check** | `pnpm type-check` | Ensure no TypeScript type errors. |
| **Frontend Build** | `pnpm build` | Verify production build of React app. |
| **Tauri Build** | `pnpm tauri:build` | Verify full application build (Dry run). |

### 1.3 Commitment

- Generate a commit **IMMEDIATELY** after a functional unit is verified.
- Follow the **Conventional Commits** standard (Section 5.2).
- Commit messages must be descriptive and reflect actual changes.
- **Commit Body**: Detailed bullet points explaining the nature of changes.

## 2. Testing Protocol (CRITICAL)

### 2.1 Integration vs. Unit

- **Prioritize Integration Tests**: For features involving multiple systems (e.g., `ChatFlow` involves User Input -> Backend -> AI -> Store -> UI), always write an integration test first.
- **Location**:
    - Unit tests: `src/__tests__/unit/` or next to source files.
    - Integration tests: `src/__tests__/integration/`.

### 2.2 Frontend Testing (Vitest + RTL)

- **Time-Dependent Tests**:
    - Always use `vi.useFakeTimers({ shouldAdvanceTime: true })` for animations.
    - Use `await act(async () => { vi.advanceTimersByTime(ms) })` to flush state updates.
    - Use `waitFor` for async assertions.
- **Mocking Globals**:
    - `window.Audio`: Use `vi.stubGlobal('Audio', ...)` or assign to `window.Audio` in `beforeEach`.
    - **Important**: Mock the *constructor* to return an object with `play`, `pause`, etc.
    - `ResizeObserver` & `IntersectionObserver`: Mock in `setup.ts`.

### 2.3 Backend Testing (Rust)

- Use standard `#[cfg(test)]` modules.
- **Thread Safety**: Some crates (like `battery`) are not `Send/Sync` on all platforms. Do not store them in long-lived state; create fresh instances or use platform-specific guards.

## 3. Architecture Standards

### 3.1 State Management (Hybrid)

- **Source of Truth**: The Backend (Rust) `AppConfig` is the single source of truth for persistent settings.
- **Frontend State**: Zustand stores mirror the backend state via IPC Events.

### 3.2 Performance

- **Animations**: **MUST** use `requestAnimationFrame` for visual updates. **NEVER** use `setInterval`.
- **Preloading**: Heavy assets must be preloaded via `useResourceStore`.

## 4. AI Agent Persona ("Ethereal")

When implementing AI features:

- **Tone**: Witty, concise (< 30 words), slightly mysterious.
- **Context**: Inject system context: `Current State: X, Mood: Y, CPU: Z%, Mem: A/B MB, Net: C KB/s, Bat: D% (State)`.

## 5. Engineering Standards

### 5.1 Package Management

- **PNPM Only**: Strictly enforced via `preinstall` hooks.

### 5.2 Git Standards

- **Commit Body**:
    - Lines < 100 characters.
    - Use bullet points for changes (e.g., `- add feature X`).
    - Describe **WHAT** and **WHY**, focusing on actual technical改动.
    - No need to strictly follow categories if they don't fit.

### 5.3 Asset Management

- **Placeholders**: Use `pnpm generate:assets` for SVG/Silent MP3 placeholders.

## 6. Troubleshooting Common Issues

### "Test timed out" in Vitest

- **Fix**: Wrap async effects in `act` or use `vi.advanceTimersByTime`.

### "window.Audio is not a constructor"

- **Fix**: `window.Audio = vi.fn().mockImplementation(() => ({ play: vi.fn(), ... })) as any;`

### "Zustand persist not working in tests"

- **Fix**: Mock `localStorage` in `setup.ts`.
