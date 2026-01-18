use std::str::FromStr;
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutEvent, ShortcutState};
use crate::config::AppConfig;

pub fn setup_global_hotkeys(app: &AppHandle) -> anyhow::Result<()> {
    refresh_hotkeys(app)
}

pub fn refresh_hotkeys(app: &AppHandle) -> anyhow::Result<()> {
    let config = AppConfig::load(app).unwrap_or_default();
    
    let _ = app.global_shortcut().unregister_all();

    let toggle_click_through = Shortcut::from_str(&config.hotkeys.toggle_click_through)?;
    let quit_shortcut = Shortcut::from_str(&config.hotkeys.quit)?;

    app.global_shortcut().register(toggle_click_through)?;
    app.global_shortcut().register(quit_shortcut)?;

    Ok(())
}

pub fn handle_global_shortcut(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    let config = AppConfig::load(app).unwrap_or_default();
    
    let toggle_click_through = Shortcut::from_str(&config.hotkeys.toggle_click_through).ok();
    let quit_shortcut = Shortcut::from_str(&config.hotkeys.quit).ok();

    if let Some(s) = toggle_click_through {
        if shortcut == &s {
            if event.state == ShortcutState::Pressed {
                let _ = app.emit("toggle-click-through-request", ());
            }
            return;
        }
    }

    if let Some(s) = quit_shortcut {
        if shortcut == &s && event.state == ShortcutState::Pressed {
            app.exit(0);
        }
    }
}
