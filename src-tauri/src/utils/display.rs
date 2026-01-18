use serde::Serialize;
use tauri::{AppHandle, Manager};

#[cfg(test)]
#[path = "display_test.rs"]
mod display_test;

#[derive(Debug, Serialize, Clone)]
pub struct MonitorInfo {
    pub name: Option<String>,
    pub position: (i32, i32),
    pub size: (u32, u32),
    pub scale_factor: f64,
    pub is_primary: bool,
}

#[tauri::command]
pub fn get_monitors(app: AppHandle) -> Result<Vec<MonitorInfo>, String> {
    let monitors = app.available_monitors().map_err(|e| e.to_string())?;
    let primary = app.primary_monitor().ok().flatten();

    let mut result = Vec::new();

    for m in monitors {
        let is_primary = if let Some(ref p) = primary {
            m.position().x == p.position().x
                && m.position().y == p.position().y
                && m.size().width == p.size().width
                && m.size().height == p.size().height
        } else {
            false
        };

        result.push(MonitorInfo {
            name: m.name().map(|s| s.to_string()),
            position: (m.position().x, m.position().y),
            size: (m.size().width, m.size().height),
            scale_factor: m.scale_factor(),
            is_primary,
        });
    }

    Ok(result)
}

#[tauri::command]
pub fn move_to_monitor(app: AppHandle, monitor_index: usize) -> Result<(), String> {
    let monitors = app.available_monitors().map_err(|e| e.to_string())?;

    if let Some(target_monitor) = monitors.get(monitor_index) {
        if let Some(window) = app.get_webview_window("main") {
            let pos = target_monitor.position();
            let new_x = pos.x + 100;
            let new_y = pos.y + 100;

            window
                .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                    x: new_x,
                    y: new_y,
                }))
                .map_err(|e| e.to_string())?;
        }
    } else {
        return Err("Monitor index out of range".to_string());
    }

    Ok(())
}
