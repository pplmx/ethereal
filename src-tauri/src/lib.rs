// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod ai;
pub mod config;
pub mod monitors;
pub mod utils;

#[tauri::command]
async fn chat_with_ethereal(app: tauri::AppHandle, message: String) -> Result<String, String> {
    use crate::config::AppConfig;

    let config = AppConfig::load(&app).unwrap_or_default();

    let client = crate::ai::OllamaClient::new(config.ai);

    client.chat(&message).await.map_err(|e| e.to_string())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    utils::hotkeys::handle_global_shortcut(app, shortcut, event);
                })
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            utils::logger::init_logging(app.handle());
            config::watch_config(app.handle().clone());
            monitors::spawn_monitor_thread(app.handle().clone());
            monitors::clipboard::ClipboardMonitor::new().start_polling(app.handle().clone());
            utils::hotkeys::setup_global_hotkeys(app.handle())?;
            utils::startup::apply_config(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            utils::window::set_click_through,
            utils::display::get_monitors,
            utils::display::move_to_monitor,
            config::save_window_position,
            config::get_config,
            config::update_config,
            chat_with_ethereal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
