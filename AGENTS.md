# Agent Guidelines & Development Standards

This document outlines the strict guidelines, patterns, and protocols that all AI Agents (and human developers) must follow when contributing to the **Ethereal** codebase.

## 1. Development Lifecycle: The Golden Loop

Every feature or fix must follow the **Implement -> Verify -> Commit** cycle. A task is NOT complete until all verification steps pass.

### 1.1 Implementation (Vibe Coding)

- **Aesthetic First**: Focus on creating a high-fidelity "Digital Spirit" look (glassmorphism, glows, fluid animations).
- **Proactive Refinement**: If a component looks "basic" or "programmer art", overhaul it using advanced CSS/Framer Motion.
- **Self-Documentation**: Write clear, naming-focused code. Use comments only for complex logic (Section 5.2).

### 1.2 Verification (Mandatory Checklist)

Before declaring a task done or creating a commit, execute commands in the following order (optimized for fast failure):

| Order | Scope | Command | Purpose | Skip Allowed? |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Type Check** | `pnpm type-check` | Ensure no TypeScript type errors | ❌ |
| 2 | **Linting (TS)** | `pnpm lint:fix` | Check and fix code style/quality | ❌ |
| 3 | **Linting (Rust)** | `pnpm lint:rs` | Format and check Rust code via Clippy | ❌ |
| 4 | **Linting (MD)** | `pnpm lint:md` | Check Markdown formatting | ✅ (code-only) |
| 5 | **Frontend Tests** | `pnpm test:run` | Ensure no regressions in UI/Logic | ❌ |
| 6 | **Backend Tests** | `pnpm test:rust` | Verify Rust logic and state machine | ❌ |
| 7 | **Frontend Build** | `pnpm build` | Verify production build of React app | ❌ |
| 8 | **Tauri Build** | `pnpm tauri:build` | Verify full application build (Dry run) | ✅ (pre-release) |
| 9 | **Visual Check** | `playwright` | Capture screenshot of `pnpm dev` to verify UI | ❌ (UI changes) |

**Failure Handling:**

- If any step fails, **STOP** and fix the issue before proceeding.
- **Never commit failing code** with the intention to "fix later".

### 1.3 Commitment

- Generate a commit **IMMEDIATELY** after a functional unit is verified.
- Follow the **Conventional Commits** standard (Section 5.2).
- Commit messages must be descriptive and reflect actual changes using bullet points.
- One commit = One logical change.

## 2. Testing Protocol (CRITICAL)

### 2.1 Coverage Requirements

| Code Type | Minimum Coverage | Enforcement |
| :--- | :---: | :--- |
| **Core Logic** | 90% | Mandatory |
| **UI Components** | 70% | Recommended |
| **Integration Flows** | 100% | Mandatory (critical paths) |

### 2.2 Frontend Testing (Vitest + RTL)

- **Time-Dependent Tests**:
    - Always use `vi.useFakeTimers({ shouldAdvanceTime: true })`.
    - Use `await act(async () => { vi.advanceTimersByTime(ms) })` to flush state updates.
    - Use `waitFor` for async assertions.
- **Mocking Globals**:
    - `window.Audio`: Use `vi.stubGlobal('Audio', ...)` or assign to `window.Audio` in `beforeEach`.
    - **Important**: Mock the *constructor* to return an object with `play`, `pause`, etc.
    - `ResizeObserver` & `IntersectionObserver`: Mock in `setup.ts`.

### 2.3 Backend Testing (Rust)

- Use standard `#[cfg(test)]` modules.
- **Thread Safety**: Some crates (like `battery`) are not `Send/Sync` on Windows. Do not store them in long-lived state; create fresh instances or use platform-specific guards.

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

#### 5.2.1 Commitment Scenarios

Commit **immediately** when:

- ✅ A standalone function/trait/struct is implemented and tested
- ✅ A frontend component or hook logic is completed and verified
- ✅ A bug is fixed **and** a regression test is added
- ✅ Documentation or configuration is updated

#### 5.2.2 Conventional Commits

**Format:** `<type>(<scope>): <description>`

| Type | Usage |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure (no behavior change) |
| `perf` | Performance improvement |
| `test` | Add/update tests |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `build` | Build system or dependencies |

#### 5.2.3 Commit Body Requirements

- Max 72 chars subject.
- Lines < 100 characters in body.
- Explain **WHAT** and **WHY**.
- Use bullet points for multiple changes.

## 6. Troubleshooting Common Issues

### "Test timed out" in Vitest

- **Fix**: Wrap async effects in `act` or use `vi.advanceTimersByTime`.

### "window.Audio is not a constructor"

- **Fix**: `window.Audio = vi.fn().mockImplementation(() => ({ play: vi.fn(), ... })) as any;`

### "Zustand persist not working in tests"

- **Fix**: Mock `localStorage` in `setup.ts`.
