// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Emitter, Manager};

pub mod ai;
pub mod config;
pub mod monitors;
pub mod utils;

#[tauri::command]
async fn chat_with_ethereal(
    app: tauri::AppHandle,
    message: String,
    history: Vec<crate::ai::ChatMessage>,
    system_context: Option<String>,
    mood: Option<String>,
) -> Result<String, String> {
    use crate::config::AppConfig;

    let config = AppConfig::load(&app).unwrap_or_default();

    // Track interaction
    if let Some(learning) = app.try_state::<crate::monitors::learning::LearningMonitor>() {
        learning.track_interaction();
    }

    let client = crate::ai::OllamaClient::new(config.ai);

    let mut full_history = history;

    // Inject learned preferences into context
    let mut learning_context = String::new();
    if config.learning.enabled {
        let top_apps: Vec<_> = config.learning.top_apps.iter().collect();
        // Sort by usage count descending
        let mut sorted_apps = top_apps;
        sorted_apps.sort_by(|a, b| b.1.cmp(a.1));

        let top_3_apps: Vec<String> = sorted_apps
            .iter()
            .take(3)
            .map(|(k, _)| k.to_string())
            .collect();

        if !top_3_apps.is_empty() {
            learning_context.push_str(&format!("User's Top Apps: {}. ", top_3_apps.join(", ")));
        }
        if config.learning.interaction_count > 100 {
            learning_context.push_str("User is a frequent chatter. ");
        }
    }

    let user_content = if let Some(ctx) = system_context {
        if !learning_context.is_empty() {
            format!(
                "System Context: {}\nLearned Context: {}\n\nUser Message: {}",
                ctx, learning_context, message
            )
        } else {
            format!("System Context: {}\n\nUser Message: {}", ctx, message)
        }
    } else if !learning_context.is_empty() {
        format!(
            "Learned Context: {}\n\nUser Message: {}",
            learning_context, message
        )
    } else {
        message
    };

    full_history.push(crate::ai::ChatMessage {
        role: "user".to_string(),
        content: user_content,
    });

    client
        .chat(full_history, mood.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--silent"]),
        ))
        .plugin(tauri_plugin_notification::init())
        .on_menu_event(|app, event| match event.id().as_ref() {
            "settings" => {
                let _ = app.emit("open-settings", ());
            }
            "about" => {
                let _ = app.emit("open-about", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
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

            // Initialize config state
            let config = config::AppConfig::load(app.handle()).unwrap_or_default();
            let config_state =
                config::ConfigState(std::sync::Arc::new(std::sync::RwLock::new(config)));
            app.manage(config_state);

            config::watch_config(app.handle().clone());

            // Initialize monitors
            let learning_monitor = monitors::learning::LearningMonitor::new(app.handle().clone());
            app.manage(learning_monitor);

            monitors::spawn_monitor_thread(app.handle().clone());
            monitors::clipboard::ClipboardMonitor::new().start_polling(app.handle().clone());
            utils::hotkeys::setup_global_hotkeys(app.handle())?;
            utils::startup::apply_config(app.handle());
            utils::tray::setup_tray(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            utils::window::set_click_through,
            utils::window::show_context_menu,
            utils::display::get_monitors,
            utils::display::move_to_monitor,
            utils::autostart::set_autostart,
            utils::autostart::is_autostart_enabled,
            config::save_window_position,
            config::get_config,
            config::update_config,
            chat_with_ethereal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
