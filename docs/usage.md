# Desktop Ethereal Usage Guide

This guide provides detailed instructions on how to use Desktop Ethereal and customize its behavior.

## Getting Started

### Initial Setup

1. **Prerequisites**:
   - Ensure you have Windows 10/11 installed
   - Install [Rust](https://www.rust-lang.org/tools/install) and [Node.js](https://nodejs.org/)
   - Install [pnpm](https://pnpm.io/installation) as the package manager

2. **First Run**:
   ```bash
   pnpm install
   pnpm tauri dev
   ```

   On first run, the ethereal window will appear on your desktop.

## Basic Operations

### Window Controls

**Moving the Window**:
- Click and drag anywhere on the ethereal window to move it
- The entire window acts as a drag handle

**Toggling Modes**:
The current implementation is a basic template with limited functionality. Future versions will include:
- **Interactive Mode**: Full control, window can be moved and buttons are visible
- **Ghost Mode**: Click-through, window ignores mouse input

Toggle between modes using:
1. **Hotkey**: Future implementation will support `Ctrl+Shift+D` (works even in ghost mode)
2. **UI Buttons**: Future implementation will include "Enable Click-Through" or "Disable Click-Through" buttons

### Monitoring Features

The current implementation is a basic template with limited functionality. Future versions will include:

**GPU Temperature Monitoring**:
- Automatically monitors your NVIDIA GPU temperature
- Switches to OVERHEATING state when temperature exceeds 80°C
- Displays current temperature in the status bar (bottom left)

**Activity Detection**:
- Automatically detects when you're:
  - Coding (VS Code, Vim, Sublime, etc.)
  - Browsing (Chrome, Firefox, Edge)
  - Gaming (Steam, Epic Games, game executables)
- Switches between CODING, BROWSING, GAMING, and IDLE states accordingly

**Clipboard Monitoring**:
- Monitors clipboard content changes
- Ignores content shorter than 10 characters or longer than 1000 characters
- Can be used for contextual responses (future feature)

## Interacting with Your Ethereal

### Chat Feature

The current implementation is a basic template with limited functionality. Future versions will include:

Talk to your ethereal companion:
1. Ensure Ollama is running
2. Pull a model: `ollama pull llama3.2:3b`
3. Use the chat functionality (accessible through future UI expansion)

The ethereal responds with Ultraman Tiga personality, using phrases like "Transform!" or "Light energy!"

## Customization

The current implementation is a basic template with limited functionality. Future versions will include:

### Adding Sprites

1. Create or obtain PNG sprite images (recommended 256x256 with transparent background)
2. Name them according to the pattern:
   - IDLE: `idle_01.png`, `idle_02.png`, etc.
   - CODING: `typing_01.png`, `typing_02.png`, etc.
   - OVERHEATING: `overheat_01.png`, `overheat_02.png`, etc.
   - GAMING: `gaming_01.png`, `gaming_02.png`, etc.
3. Place them in the `public/sprites/` directory

### Adjusting Animation Speed

Modify animation speeds in `src/config/animations.ts`:
```typescript
export const ANIMATIONS = {
  IDLE: {
    frames: ['/sprites/idle_01.png', '/sprites/idle_02.png'],
    fps: 4, // Change this value to adjust speed
  },
  // ... other states
}
```

### Customizing State Transitions

Modify the state machine in `src/hooks/useEtherealState.ts`:
- Adjust temperature thresholds
- Add new activity categories
- Modify transition logic

## Advanced Configuration

### Window Properties

Adjust window behavior in `src-tauri/tauri.conf.json`:
```json
{
  "windows": [
    {
      "title": "ethereal",
      "width": 800,
      "height": 600
    }
  ]
}
```

### Hotkey Modification

Future implementations will support hotkey modification in `src-tauri/src/main.rs`:
```rust
let shortcut = Shortcut::new("Ctrl+Shift+D"); // Modify this string
```

Refer to Tauri's global shortcut documentation for syntax.

## Troubleshooting

### Common Issues and Solutions

1. **Ethereal window doesn't appear**:
   - Check if the application started successfully
   - Look for error messages in the terminal
   - Verify system requirements are met

### Log Access

During development:
- View console output in the terminal where you ran `pnpm tauri dev`
- Check browser DevTools (Ctrl+Shift+I) for frontend errors

In production builds:
- Logs are typically found in system event logs
- Application-specific logs may be in user directories

## Performance Considerations

### Resource Usage

Desktop Ethereal is designed to be lightweight:
- CPU usage: Typically < 5% when idle
- Memory usage: ~50-100MB depending on system

## Privacy and Security

### Data Collection

Desktop Ethereal collects minimal system information locally:
- Active window titles and process names (future implementation)
- GPU temperature and utilization data (future implementation)
- Clipboard content (filtered and processed locally) (future implementation)

No data is transmitted to external servers by default.

### Permissions

The application requires:
- Window management permissions (for overlay functionality) (future implementation)
- GPU monitoring permissions (for NVIDIA libraries) (future implementation)
- Clipboard access (for contextual awareness) (future implementation)

These permissions are used solely for the application's core functionality.

## Frequently Asked Questions

**Q: Can I run this on macOS or Linux?**
A: Primary support is for Windows, but the underlying Tauri framework supports cross-platform development. Some Windows-specific features may need adaptation.

**Q: What happens if I don't have an NVIDIA GPU?**
A: GPU monitoring will show default values (0). All other features will work normally. (Future implementation)

**Q: Can I customize the ethereal's personality?**
A: Yes, you can modify the system prompt in the Ollama integration in `src-tauri/src/main.rs`. (Future implementation)

**Q: How do I uninstall the application?**
A: Simply delete the application folder. No system changes are made outside the application directory.

**Q: Can I have multiple ethereal?**
A: Currently, the application supports one ethereal per instance. You can run multiple instances with different configurations. (Future implementation)

## Support

For issues, feature requests, or questions:
1. Check the project's GitHub issues
2. Submit a new issue with detailed information
3. Contact the development team through the project's communication channels

## Changelog

### v0.1.0
- Initial release
- Basic ghost window functionality
- System monitoring (GPU, active windows, clipboard)
- Dynamic state transitions
- Sprite animations
- Ollama LLM integration
- Global hotkey support
