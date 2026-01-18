# 🛠️ Ethereal Technical Documentation

This document provides an in-depth look at the architecture, state management, and implementation details of the Ethereal desktop companion.

## 🏗️ Architecture Overview

Ethereal is built on the **Tauri 2.0** framework, leveraging a hybrid architecture:

- **Backend (Rust)**: High-performance system monitoring, global hotkeys, file watching, and local AI orchestration.
- **Frontend (React 19)**: High-fidelity visual rendering, emotional state machine visualization, and user configuration.
- **Communication**: Asynchronous events (e.g., `gpu-update`) for one-way streaming and `invoke` commands for request-response cycles.

---

## 🖥️ Backend Implementation

### 1. Configuration Engine (`config.rs`)

- **Persistence**: Settings are stored in `ethereal.toml` within the OS-standard app configuration directory.
- **Hot-Reloading**: Uses `notify-debouncer-mini` to watch for manual edits to the TOML file, automatically refreshing the spirit's behavior without restart.
- **Validation**: Strongly typed structures with `serde` ensure configuration integrity.

### 2. System Perception Layer (`monitors/`)

- **Hardware**: Uses `sysinfo` for CPU/RAM and `battery` for power states.
- **Activity**: Leverages `active-win-pos-rs` to categorize user behavior based on focused window metadata.
- **Clipboard**: A dedicated polling thread via `arboard` monitors for code snippets or log traces.

### 3. Intelligence Layer (`ai/`)

- **Ollama Client**: A custom async client for the Ollama chat API.
- **Memory Management**: Implements a sliding window history (10 messages) that is passed to the LLM to provide conversational continuity.
- **Context Injection**: Every user message is prepended with a "System Context" string containing current hardware stats and mood, allowing the AI to be "self-aware".

---

## 🎨 Frontend implementation

### 1. Visual Rendering

- **`SpriteAnimator`**: A custom loop utilizing `requestAnimationFrame` for stutter-free frame transitions. It calculates dynamic FPS based on the spirit's mood (e.g., faster when Excited, lethargic when Tired).
- **Glassmorphism**: Uses Tailwind CSS with backdrop-blur filters and high-opacity indigo/purple gradients for a "Digital Spirit" look.

### 2. State Management (Zustand)

- **`useSpriteStore`**: Centralizes the emotional state. Maps raw backend data into semantic states (`Overheating`, `HighLoad`, etc.) and moods.
- **`useResourceStore`**: Manages the lifecycle of external assets (sprites/sounds). Implements preloading to prevent "visual popping" during state transitions.

### 3. Error Recovery

- **Global Error Boundary**: A high-level React component that catches rendering crashes and provides a graceful "Re-materialize" button to reset the UI state.

---

## 🎭 State Machine Logic

The spirit's behavior is governed by a priority queue:

1. **Overheating**: (Critical) Triggered by GPU/CPU temp > thresholds.
2. **Low Battery**: (High) Triggered when laptop power is critical.
3. **High Load**: (Medium) Triggered by extreme resource utilization.
4. **Activity Based**: (Low) `Working`, `Gaming`, or `Browsing` based on the active app.
5. **Idle**: (Default) Fallback when no other conditions are met.

---

## 🧪 Quality Assurance

### 1. Testing Suite

- **Frontend**: 70+ Vitest tests covering store logic and complex integration flows (e.g., the "Chat Loop").
- **Backend**: Rust unit tests for the state machine and configuration parser.
- **Visual**: Playwright E2E tests capture screenshots to prevent regression in the spirit's aesthetic.

### 2. The "Golden Loop"

All contributions must follow the strict cycle defined in `AGENTS.md`:
`Implement -> Type Check -> Lint -> Test -> Build -> Visual Check -> Commit`.

---

## 🚀 Deployment & Distribution

- **CI/CD**: GitHub Actions automates the build process for Windows, generating signed installers.
- **Bundle**: Uses Tauri's native bundler to create minimal-footprint installers (< 10MB excluding assets).
