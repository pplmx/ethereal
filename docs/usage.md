# ✨ Desktop Ethereal Usage Guide

Welcome to the world of Ethereal! This guide will help you interact with, customize, and master your digital companion.

## 🚀 Getting Started

### Installation

1. Download the latest installer from the [Releases](https://github.com/pplmx/ethereal/releases) page.
2. Run the installer and follow the prompts.
3. Ensure **Ollama** is installed and running on your system for AI features. We recommend pulling the `llama3.2` model:

    ```bash
    ollama pull llama3.2
    ```

### First Awakening

Upon the first launch, you'll be greeted by the **Welcome Modal**. This guide explains the core nature of your spirit. Click "Awaken the Spirit" to begin.

---

## 🎮 Controls & Interaction

### Window Management

- **Moving**: Click and drag anywhere on the spirit to move it.
- **Ghost Mode**: Press `Ctrl+Shift+E` to toggle click-through mode. When enabled, the spirit will ignore mouse clicks, allowing you to work "through" it.
- **Context Menu**: Right-click on the spirit (when not in ghost mode) to access settings, move the spirit to different monitors, or quit.

### AI Interaction

- **Clipboard Trigger**: Copy a code snippet or an error message to your clipboard. If the content is significant, the spirit will process it and offer advice or commentary via a speech bubble.
- **Double-Click**: By default, double-clicking the spirit will trigger a friendly greeting or a contextual chat response.
- **Memory**: The spirit remembers the last 10 exchanges, allowing for multi-turn conversations.

---

## 🎭 State & Mood System

The spirit's appearance and behavior change based on your system's "pulse":

| State | Trigger | Spirit Behavior |
| :--- | :--- | :--- |
| **IDLE** | System is relaxed | Soft floating, indigo aura. |
| **WORKING** | Coding apps in focus | Focus animation, purple aura. |
| **GAMING** | Games in focus | Energetic movement, cyan aura. |
| **OVERHEATING** | Hardware > 80°C | Rapid flickering, rose aura, irritable. |
| **HIGH_LOAD** | CPU/RAM pressure | Strained movement, amber aura. |
| **THINKING** | Processing AI request | Thinking animation, pulse effect. |

---

## 🛠️ Customization

### Changing the Look (Drag-and-Drop)

You can completely change how the spirit looks:

1. Prepare a folder containing SVG or PNG files named following the pattern: `idle-1.svg`, `idle-2.svg`, `working-1.svg`, etc.
2. Drag and drop the **folder** (or any file within it) onto the spirit window.
3. The spirit will instantly update its "clothes" and thank you!

### Settings Panel

Access the settings via the right-click menu or by double-clicking (if configured):

- **Window**: Toggle "Always on Top", "Autostart", and manage multi-monitor placement.
- **Hardware**: View real-time stats and adjust temperature thresholds.
- **AI**: Change model names, API endpoints, or the spirit's base personality.
- **Sound**: Enable/disable interaction sound effects.
- **Sprite**: Preview all animation states for the current skin.
- **Hotkeys**: Remap global shortcuts.

---

## 🔋 Performance & Privacy

### Resource Usage

Ethereal is designed to be a "zero-impact" companion:

- **Idle**: < 1% CPU, ~60MB RAM.
- **Animations**: Uses GPU-accelerated CSS and `requestAnimationFrame`.

### Privacy

- **Local AI**: All chat processing happens locally via Ollama. No data is sent to external clouds.
- **Window Titles**: You can disable "Share Window Title" in **Settings -> Privacy** if you prefer the spirit not to know which specific files you're editing.

---

## ❓ Troubleshooting

- **Spirit is "Invisible"**: Check if it's moved to a disconnected monitor. Use the system tray icon to "Reset Position".
- **AI Not Responding**: Ensure Ollama is running and the `llama3.2` model is available. Check the API endpoint in settings (default: `http://localhost:11434`).
- **No Sound**: Verify that your system volume is up and "Enable Sound" is checked in settings.

**Enjoy your new digital companion!** ✨
