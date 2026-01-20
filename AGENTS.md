# AI Agent Guidelines

> Guidelines for AI agents contributing to the Ethereal codebase.
> For development setup, see [Development Guide](docs/development.md).

## Philosophy: Vibe Coding

- **Aesthetic First** - Create high-fidelity "Digital Spirit" visuals (glassmorphism, glows, fluid animations)
- **Quality Over Speed** - Better to do one thing perfectly than rush through many
- **Leave Code Better** - Every touch should improve the codebase

---

## The Golden Loop

```text
Implement → Verify → Commit → Repeat
```

A task is NOT complete until all verification passes.

### Verification Commands

```bash
pnpm typecheck    # 1. TypeScript errors
pnpm lint:fix     # 2. Biome (format + lint)
pnpm lint:rs      # 3. Rust Clippy
pnpm test:run     # 4. Frontend tests
pnpm test:rs      # 5. Backend tests
pnpm build        # 6. Production build
```

**If any step fails → STOP → Fix → Restart from step 1**

---

## Commit Discipline

### When to Commit

✅ **Commit immediately** after:

- A single component/function is implemented AND verified
- A bug is fixed AND a regression test is added
- A refactor is complete with tests passing
- Documentation is updated

❌ **Never**:

- Commit failing code to "fix later"
- Batch unrelated changes into one commit
- Skip verification steps

### Commit Message Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | When |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure (no behavior change) |
| `perf` | Performance improvement |
| `test` | Add/update tests only |
| `docs` | Documentation only |
| `style` | Formatting (no logic change) |
| `build` | Build system or dependencies |
| `ci` | CI/CD |

**Examples:**

```bash
# Good ✅
feat(ai): add conversation history support
fix(monitor): handle GPU disconnect gracefully
refactor(store): extract state machine to separate module
test(sprite): add animation frame cycling tests

# Bad ❌
update code
fix stuff
wip
```

### Commit Body (for complex changes)

- Explain **WHAT** changed and **WHY**
- Use bullet points for multiple changes
- Max 88 chars for subject, 120 chars for body lines

```text
fix(monitor): handle GPU disconnect gracefully

- Add fallback to CPU monitoring when GPU unavailable
- Emit warning notification instead of crashing
- Add retry logic with exponential backoff

Closes #42
```

---

## Testing Patterns

### Time-Dependent Tests

```typescript
vi.useFakeTimers({ shouldAdvanceTime: true });

await act(async () => {
  vi.advanceTimersByTime(100);
});

// Always restore
afterEach(() => {
  vi.useRealTimers();
});
```

### Mocking Audio

```typescript
beforeEach(() => {
  window.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    volume: 1,
  })) as any;
});
```

### Mocking Observers

```typescript
// In setup.ts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

---

## AI Persona ("Ethereal")

When implementing AI responses:

- **Tone**: Witty, concise (<30 words), slightly mysterious
- **Context**: Include system state:

  ```text
  State: Working, Mood: Happy, CPU: 45%, Mem: 8/16GB
  ```

- **Personality**: The spirit is aware of its environment

---

## Architecture Rules

| Rule | Reason |
| :--- | :--- |
| Backend is source of truth | `AppConfig` (TOML) owns settings |
| Use `requestAnimationFrame` | Never `setInterval` for animations |
| Preload assets | Use `useResourceStore` to avoid popping |
| Error boundaries | Wrap major components |

---

## Troubleshooting

| Error | Fix |
| :--- | :--- |
| Test timed out | Wrap in `act()` or `vi.advanceTimersByTime` |
| Audio not a constructor | Mock `window.Audio` in `beforeEach` |
| Zustand persist fails | Mock `localStorage` in `setup.ts` |
| Battery crate not Send | Create fresh instances per call |
| Component not updating | Check if using `shallow` selector |

---

## File Naming Conventions

| Type | Pattern | Example |
| :--- | :--- | :--- |
| Component | PascalCase | `SpriteAnimator.tsx` |
| Hook | camelCase, `use` prefix | `useSpriteStore.ts` |
| Store | camelCase, `Store` suffix | `spriteStore.ts` |
| Test | same name + `.test` | `SpriteAnimator.test.tsx` |
| Rust module | snake_case | `sprite_state.rs` |
