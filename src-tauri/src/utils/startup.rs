use crate::config::AppConfig;
use tauri::{AppHandle, Manager};

pub fn apply_config(app: &AppHandle) {
    if let Ok(config) = AppConfig::load(app) {
        if let Some(target_monitor) = config.window.target_monitor {
            if let Ok(monitors) = crate::utils::display::get_monitors(app.clone()) {
                if let Some(monitor) = monitors
                    .iter()
                    .find(|m| m.name.as_ref() == Some(&target_monitor))
                {
                    if let Some(window) = app.get_webview_window("main") {
                        let pos = monitor.position;
                        let new_x = pos.0 + config.window.default_x;
                        let new_y = pos.1 + config.window.default_y;

                        let _ = window.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition { x: new_x, y: new_y },
                        ));
                    }
                }
            }
        }
    }
}
