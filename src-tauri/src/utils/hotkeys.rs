use tauri::{AppHandle, Manager, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutEvent, ShortcutState, Shortcut};
use std::str::FromStr;

pub fn setup_global_hotkeys(app: &AppHandle) -> anyhow::Result<()> {
    let toggle_click_through = Shortcut::from_str("Ctrl+Shift+E")?;
    let quit_shortcut = Shortcut::from_str("Ctrl+Shift+Q")?;

    app.global_shortcut().register(toggle_click_through)?;
    app.global_shortcut().register(quit_shortcut)?;

    Ok(())
}

pub fn handle_global_shortcut(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    let toggle_click_through = Shortcut::from_str("Ctrl+Shift+E").unwrap();
    let quit_shortcut = Shortcut::from_str("Ctrl+Shift+Q").unwrap();

    if shortcut == &toggle_click_through {
         if event.state == ShortcutState::Pressed {
             let _ = app.emit("toggle-click-through-request", ());
         }
    } else if shortcut == &quit_shortcut {
        if event.state == ShortcutState::Pressed {
            app.exit(0);
        }
    }
}
