# 🤝 Contributing to Ethereal

Thank you for your interest in contributing to **Ethereal**! We are building a high-fidelity digital companion, and we value your help in making it more intelligent, beautiful, and robust.

## 🚀 Getting Started

1. **Fork & Clone**: Fork the repository and clone it to your local machine.
2. **Environment Setup**:
    - Install [Rust](https://www.rust-lang.org/tools/install) (latest stable).
    - Install [Node.js](https://nodejs.org/) (LTS) and [pnpm](https://pnpm.io/installation).
    - Install [Ollama](https://ollama.com/) for AI feature development.
3. **Install Dependencies**:

    ```bash
    pnpm install
    ```

4. **Verify Setup**:

    ```bash
    pnpm test:run
    ```

---

## 🔄 The Golden Loop (Development Standards)

Every contribution MUST follow the **Implement -> Verify -> Commit** cycle. A task is NOT complete until all verification steps pass.

### 1. Implementation

- **Aesthetic First**: Focus on creating high-fidelity "Digital Spirit" visuals (glassmorphism, glows, fluid animations).
- **Self-Documentation**: Write clear, naming-focused code. Use comments only for truly complex logic.

### 2. Mandatory Verification

Before submitting a PR or creating a commit, execute these commands in order:

| Step | Command | Purpose |
| :--- | :--- | :--- |
| 1 | `pnpm type-check` | Ensure no TypeScript errors. |
| 2 | `pnpm lint:fix` | Check and fix code quality/formatting (Biome). |
| 3 | `pnpm lint:rs` | Format and check Rust code (Clippy). |
| 4 | `pnpm test:run` | Ensure no regressions in UI/Logic. |
| 5 | `pnpm test:rust` | Verify Rust logic and state machine. |
| 6 | `pnpm build` | Verify production build of React app. |

### 3. Commitment

- Follow **Conventional Commits**: `feat(ai): add history support`.
- One commit = One logical change.

---

## 🛠️ Project Structure

- `src/`: React frontend.
    - `components/`: UI elements (using Tailwind + Framer Motion).
    - `stores/`: Zustand state management.
    - `hooks/`: Reusable React logic.
- `src-tauri/`: Rust backend.
    - `src/monitors/`: Hardware and activity sensing.
    - `src/ai/`: Ollama integration logic.
    - `src/config.rs`: Central source of truth for settings.
- `public/sprites/`: Default animation frames.

---

## 🎨 Design Principles

- **Glassmorphism**: High transparency, backdrop blurs, and thin borders.
- **Fluidity**: All visual changes should be animated using `framer-motion` or `requestAnimationFrame`.
- **Non-Intrusive**: The spirit should feel like a companion, not an interruption. Use "Ghost Mode" (click-through) by default.

## 🧪 Testing Guidelines

- **Frontend**: Use Vitest + React Testing Library. Mock Tauri APIs in `src/__tests__/setup.ts`.
- **Rust**: Use standard `#[cfg(test)]` modules.
- **Visual**: Use Playwright for visual regression testing (screenshots in `e2e-screenshots/`).

## 📬 Submitting a Pull Request

1. Create a branch from `main`: `git checkout -b feature/cool-new-thing`.
2. Ensure the "Golden Loop" passes completely.
3. Write a clear PR description summarizing the **Why** and **How**.
4. Wait for review from maintainers.

**Thank you for making Ethereal magical!** ✨
