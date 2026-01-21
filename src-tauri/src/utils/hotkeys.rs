use crate::config::AppConfig;
use std::str::FromStr;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutEvent, ShortcutState};

pub fn setup_global_hotkeys(app: &AppHandle) -> anyhow::Result<()> {
    refresh_hotkeys(app)
}

pub fn refresh_hotkeys(app: &AppHandle) -> anyhow::Result<()> {
    let config = AppConfig::load(app).unwrap_or_default();
    let _ = app.global_shortcut().unregister_all();

    // Helper to register a shortcut and log interaction
    let register = |key: &str, name: &str| match Shortcut::from_str(key) {
        Ok(shortcut) => {
            if let Err(e) = app.global_shortcut().register(shortcut) {
                tracing::error!("Failed to register {} hotkey '{}': {}", name, key, e);
            }
        }
        Err(e) => {
            tracing::error!("Failed to parse {} hotkey '{}': {}", name, key, e);
        }
    };

    register(&config.hotkeys.toggle_click_through, "toggle_click_through");
    register(&config.hotkeys.quit, "quit");

    Ok(())
}

pub fn handle_global_shortcut(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    let config = if let Some(state) = app.try_state::<crate::config::ConfigState>() {
        state.0.read().unwrap().clone()
    } else {
        AppConfig::load(app).unwrap_or_default()
    };

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

#[cfg(test)]
mod tests {
    use std::str::FromStr;
    use tauri_plugin_global_shortcut::Shortcut;

    #[test]
    fn test_parse_valid_hotkeys() {
        assert!(
            Shortcut::from_str("Ctrl+Shift+E").is_ok(),
            "Should parse Ctrl+Shift+E"
        );
        assert!(Shortcut::from_str("Alt+F4").is_ok(), "Should parse Alt+F4");
        // tauri-plugin-global-shortcut typically accepts electron-style accelerators
        // "CommandOrControl" is common
        assert!(
            Shortcut::from_str("CommandOrControl+P").is_ok(),
            "Should parse CommandOrControl+P"
        );
    }

    #[test]
    fn test_parse_modifiers() {
        // Ensure standard modifiers work
        assert!(Shortcut::from_str("Ctrl+A").is_ok());
        assert!(Shortcut::from_str("Alt+B").is_ok());
        assert!(Shortcut::from_str("Shift+C").is_ok());
        // Verify Super/Meta support (frontend emits "Meta", backend might need "Super" or "Command")
        // Note: "Meta" is often standard in these parsers, but let's verify.
        let meta = Shortcut::from_str("Meta+D");
        let super_key = Shortcut::from_str("Super+D");
        let command = Shortcut::from_str("Command+D");

        // At least one of these should work for windows key / cmd key
        assert!(
            meta.is_ok() || super_key.is_ok() || command.is_ok(),
            "Should support some form of Meta/Super key"
        );
    }

    #[test]
    fn test_parse_invalid_hotkeys() {
        assert!(
            Shortcut::from_str("").is_err(),
            "Empty string should be invalid"
        );
        // Unknown keys should fail
        assert!(Shortcut::from_str("Covfefe+A").is_err());
    }
}
