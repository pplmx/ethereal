// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod utils;
pub mod config;
pub mod monitors;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().with_handler(|app, shortcut, event| {
            utils::hotkeys::handle_global_shortcut(app, shortcut, event);
        }).build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            utils::logger::init_logging(app.handle());
            config::watch_config(app.handle().clone());
            utils::hotkeys::setup_global_hotkeys(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            utils::window::set_click_through,
            config::save_window_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
