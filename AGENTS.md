# Agent Guidelines & Development Standards

This document outlines the strict guidelines, patterns, and protocols that all AI Agents (and human developers) must follow when contributing to the **Ethereal** codebase.

## 1. Development Lifecycle: The Golden Loop

Every feature or fix must follow the **Implement -> Verify -> Commit** cycle. A task is NOT complete until all verification steps pass.

### 1.1 Implementation (Vibe Coding)

- Follow existing patterns and architecture standards (Section 3).
- Write self-documenting code with clear naming.
- Use comments only for complex business logic or algorithmic explanations (Section 6.2).
- Prefer composition over inheritance.
- Keep functions small and focused (< 50 lines preferred).

### 1.2 Verification (Mandatory Checklist)

Before declaring a task done or creating a commit, execute commands in the following order (optimized for fast failure):

| Order | Scope | Command | Purpose | Skip Allowed? |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Type Check** | `pnpm type-check` | Ensure no TypeScript type errors | ❌ |
| 2 | **Linting (TS)** | `pnpm lint:fix` | Check and fix code style/quality | ❌ |
| 3 | **Linting (Rust)** | `pnpm lint:rs` | Format and check Rust code via Clippy | ❌ |
| 4 | **Linting (MD)** | `pnpm lint:md` | Check Markdown formatting | ✅ (code-only changes) |
| 5 | **Frontend Tests** | `pnpm test:run` | Ensure no regressions in UI/Logic | ❌ |
| 6 | **Backend Tests** | `pnpm test:rust` | Verify Rust logic and state machine | ❌ |
| 7 | **Frontend Build** | `pnpm build` | Verify production build of React app | ❌ |
| 8 | **Tauri Build** | `pnpm tauri:build` | Verify full application build (Dry run) | ✅ (pre-release) |

**Failure Handling:**

- If any step fails, **STOP** and fix the issue before proceeding.
- For documentation-only changes, steps 5-8 may be skipped.
- For Rust-only changes, step 5 may be skipped if no TypeScript changes exist.
- **Never commit failing code** with the intention to "fix later".

### 1.3 Commitment

- Generate a commit **IMMEDIATELY** after a functional unit is verified.
- Follow the **Conventional Commits** standard (Section 6.2).
- Commit messages must be descriptive and reflect actual changes.
- One commit = One logical change (avoid mixing refactors with features).

## 2. Testing Protocol (CRITICAL)

### 2.1 Coverage Requirements

| Code Type | Minimum Coverage | Enforcement |
| :--- | :---: | :--- |
| **Core Logic** (stores, utils, hooks) | 90% | Mandatory |
| **UI Components** | 70% | Recommended |
| **Integration Flows** | 100% | Mandatory (critical paths) |
| **Type Definitions** | N/A | Type-check only |

**Critical Paths Requiring 100% Coverage:**

- Authentication flows
- State synchronization (Frontend ↔ Backend)
- IPC communication layer
- File system operations
- Settings persistence

### 2.2 Test Types Priority

1. **Integration Tests** (Preferred): Test complete user flows involving multiple systems.
2. **Unit Tests**: Isolated logic, utilities, pure functions, custom hooks.
3. **E2E Tests**: Critical paths only (expensive, use sparingly).

**Location Standards:**

- Unit tests: `src/__tests__/unit/` or colocated with source files (`*.test.ts`).
- Integration tests: `src/__tests__/integration/`.
- E2E tests: `e2e/` (if implemented).

### 2.3 Frontend Testing (Vitest + RTL)

- **Time-Dependent Tests**:
    - Always use `vi.useFakeTimers({ shouldAdvanceTime: true })` for animations.
    - Use `await act(async () => { vi.advanceTimersByTime(ms) })` to flush state updates.
    - Use `waitFor` for async assertions.
- **Mocking Globals**:
    - `window.Audio`: Use `vi.stubGlobal('Audio', ...)` or assign to `window.Audio` in `beforeEach`.
    - **Important**: Mock the *constructor* to return an object with `play`, `pause`, etc.
    - `ResizeObserver` & `IntersectionObserver`: Mock in `setup.ts`.

### 2.4 Backend Testing (Rust)

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

#### 5.2.1 Commitment Scenarios

Commit **immediately** when:

- ✅ A standalone function/trait/struct is implemented and tested
- ✅ A frontend component or hook logic is completed and verified
- ✅ A bug is fixed **and** a regression test is added
- ✅ Documentation or configuration is updated
- ✅ Refactoring is complete and all tests pass

**DO NOT** accumulate changes across multiple features or mix unrelated changes.

#### 5.2.2 Conventional Commits

**Format:** `<type>(<scope>): <description>`

**Types:**

| Type | Usage | Example |
| :--- | :--- | :--- |
| `feat` | New feature | `feat(chat): add message streaming` |
| `fix` | Bug fix | `fix(store): prevent state race condition` |
| `refactor` | Code restructure (no behavior change) | `refactor(utils): extract validation logic` |
| `perf` | Performance improvement | `perf(renderer): optimize canvas drawing` |
| `test` | Add/update tests | `test(chat): add integration test for flow` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `style` | Code style (formatting, no logic change) | `style(chat): fix indentation` |
| `build` | Build system or dependencies | `build(deps): upgrade tauri to 2.1` |
| `ci` | CI/CD configuration | `ci(github): add automated release workflow` |
| `chore` | Other (tooling, config) | `chore(lint): add new eslint rule` |

#### 5.2.3 Breaking Changes

```txt
feat(api)!: redesign settings API

BREAKING CHANGE: Settings API now uses async/await pattern.
Migration guide:

Before:
  const settings = getSettings();

After:
  const settings = await getSettings();
```

#### 5.2.4 Commit Body Requirements

**Subject Line:**

- Max 72 characters
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- Lowercase after type/scope

**Body:**

- Lines < 100 characters
- Separate from subject with blank line
- Explain **WHAT** and **WHY**, not HOW (code shows how)
- Use bullet points for multiple changes
- Reference issues: `Fixes #123` or `Relates to #456`

**Example:**

```txt
feat(chat): implement message retry mechanism

- Add retry logic with exponential backoff (3 attempts max)
- Store failed messages in separate queue
- Display retry button in UI for failed messages
- Emit event when all retries exhausted

Fixes #142
Relates to #98
```

### 5.3 Asset Management

- **Placeholders**: Use `pnpm generate:assets` for SVG/Silent MP3 placeholders.

## 6. Troubleshooting Common Issues

### "Test timed out" in Vitest

- **Fix**: Wrap async effects in `act` or use `vi.advanceTimersByTime`.

### "window.Audio is not a constructor"

- **Fix**: `window.Audio = vi.fn().mockImplementation(() => ({ play: vi.fn(), ... })) as any;`

### "Zustand persist not working in tests"

- **Fix**: Mock `localStorage` in `setup.ts`.
