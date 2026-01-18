use notify_debouncer_mini::{new_debouncer, notify::RecursiveMode};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

#[cfg(test)]
#[path = "config_test.rs"]
mod config_test;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AppConfig {
    pub window: WindowConfig,
    pub hardware: HardwareConfig,
    pub ai: AiConfig,
    pub sound: SoundConfig,
    pub mood: MoodConfig,
    pub hotkeys: HotkeyConfig,
    pub notifications: NotificationConfig,
    pub sleep: SleepConfig,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct NotificationConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default = "default_true")]
    pub notify_on_overheating: bool,
    #[serde(default = "default_true")]
    pub notify_on_angry: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SleepConfig {
    #[serde(default = "default_false")]
    pub enabled: bool,
    #[serde(default = "default_sleep_start")]
    pub start_time: String,
    #[serde(default = "default_sleep_end")]
    pub end_time: String,
}

fn default_true() -> bool {
    true
}
fn default_false() -> bool {
    false
}
fn default_sleep_start() -> String {
    "23:00".to_string()
}
fn default_sleep_end() -> String {
    "07:00".to_string()
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HotkeyConfig {
    #[serde(default = "default_toggle_click_through")]
    pub toggle_click_through: String,
    #[serde(default = "default_quit")]
    pub quit: String,
}

fn default_toggle_click_through() -> String {
    "Ctrl+Shift+E".to_string()
}

fn default_quit() -> String {
    "Ctrl+Shift+Q".to_string()
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct MoodConfig {
    #[serde(default = "default_boredom_threshold")]
    pub boredom_threshold_cpu: f32,
}

fn default_boredom_threshold() -> f32 {
    5.0
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            window: WindowConfig {
                default_x: default_x(),
                default_y: default_y(),
                always_on_top: default_on_top(),
                target_monitor: None,
            },
            hardware: HardwareConfig {
                monitor_source: default_monitor_source(),
                polling_interval_ms: default_polling_interval(),
                thresholds: ThresholdsConfig::default(),
            },
            ai: AiConfig {
                model_name: default_model(),
                api_endpoint: default_api_endpoint(),
                system_prompt: default_system_prompt(),
                max_response_length: default_max_length(),
                cooldown_seconds: default_cooldown(),
            },
            sound: SoundConfig {
                enabled: default_sound_enabled(),
                volume: default_volume(),
            },
            mood: MoodConfig {
                boredom_threshold_cpu: default_boredom_threshold(),
            },
            hotkeys: HotkeyConfig {
                toggle_click_through: default_toggle_click_through(),
                quit: default_quit(),
            },
            notifications: NotificationConfig {
                enabled: default_true(),
                notify_on_overheating: default_true(),
                notify_on_angry: default_true(),
            },
            sleep: SleepConfig {
                enabled: default_false(),
                start_time: default_sleep_start(),
                end_time: default_sleep_end(),
            },
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct WindowConfig {
    #[serde(default = "default_x")]
    pub default_x: i32,
    #[serde(default = "default_y")]
    pub default_y: i32,
    #[serde(default = "default_on_top")]
    pub always_on_top: bool,
    pub target_monitor: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HardwareConfig {
    #[serde(default = "default_monitor_source")]
    pub monitor_source: String,
    #[serde(default = "default_polling_interval")]
    pub polling_interval_ms: u64,
    #[serde(default)]
    pub thresholds: ThresholdsConfig,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ThresholdsConfig {
    #[serde(default = "default_gpu_temp")]
    pub nvidia_temp: f32,
    #[serde(default = "default_gpu_temp")]
    pub amd_temp: f32,
    #[serde(default = "default_cpu_temp")]
    pub cpu_temp: f32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AiConfig {
    #[serde(default = "default_model")]
    pub model_name: String,
    #[serde(default = "default_api_endpoint")]
    pub api_endpoint: String,
    #[serde(default = "default_system_prompt")]
    pub system_prompt: String,
    #[serde(default = "default_max_length")]
    pub max_response_length: usize,
    #[serde(default = "default_cooldown")]
    pub cooldown_seconds: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SoundConfig {
    #[serde(default = "default_sound_enabled")]
    pub enabled: bool,
    #[serde(default = "default_volume")]
    pub volume: f32,
}

fn default_x() -> i32 {
    100
}
fn default_y() -> i32 {
    100
}
fn default_on_top() -> bool {
    true
}
fn default_monitor_source() -> String {
    "auto".to_string()
}
fn default_polling_interval() -> u64 {
    2000
}
fn default_gpu_temp() -> f32 {
    80.0
}
fn default_cpu_temp() -> f32 {
    85.0
}
fn default_model() -> String {
    "llama3.2".to_string()
}
fn default_api_endpoint() -> String {
    "http://localhost:11434".to_string()
}
fn default_system_prompt() -> String {
    "You are Ethereal, a digital spirit living in the code. \
     Reply concisely (under 30 words). \
     Be witty and slightly mysterious. \
     Your current mood and system status are provided in the context. \
     Incorporate your mood into your personality (e.g., if Tired, be lethargic; \
     if Excited, be energetic). If asked about code, be professional but keep the persona."
        .to_string()
}
fn default_max_length() -> usize {
    100
}
fn default_cooldown() -> u64 {
    30
}
fn default_sound_enabled() -> bool {
    true
}
fn default_volume() -> f32 {
    0.5
}

impl Default for ThresholdsConfig {
    fn default() -> Self {
        Self {
            nvidia_temp: default_gpu_temp(),
            amd_temp: default_gpu_temp(),
            cpu_temp: default_cpu_temp(),
        }
    }
}

impl AppConfig {
    pub fn load(app: &AppHandle) -> anyhow::Result<Self> {
        let config_dir = app.path().app_config_dir()?;
        if !config_dir.exists() {
            std::fs::create_dir_all(&config_dir)?;
        }
        let config_path = config_dir.join("ethereal.toml");

        if !config_path.exists() {
            let default_config = Self::default();
            default_config.save(app)?;
            return Ok(default_config);
        }

        let config = config::Config::builder()
            .add_source(config::File::from(config_path))
            .add_source(config::Environment::with_prefix("ETHEREAL"))
            .build()?;

        Ok(config.try_deserialize()?)
    }

    pub fn save(&self, app: &AppHandle) -> anyhow::Result<()> {
        let config_path = app.path().app_config_dir()?.join("ethereal.toml");
        let toml = toml::to_string_pretty(self)?;
        std::fs::write(config_path, toml)?;
        Ok(())
    }
}

#[tauri::command]
pub fn get_config(app: AppHandle) -> Result<AppConfig, String> {
    AppConfig::load(&app).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    config.save(&app).map_err(|e| e.to_string())?;

    let _ = crate::utils::hotkeys::refresh_hotkeys(&app);

    app.emit("config-updated", config)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_window_position(app: AppHandle, x: i32, y: i32) -> Result<(), String> {
    let mut config = AppConfig::load(&app).map_err(|e| e.to_string())?;
    config.window.default_x = x;
    config.window.default_y = y;
    config.save(&app).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn watch_config(app: AppHandle) {
    let app_handle = app.clone();
    std::thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut debouncer = new_debouncer(Duration::from_secs(2), tx).unwrap();

        let config_path = match app_handle.path().app_config_dir() {
            Ok(p) => p.join("ethereal.toml"),
            Err(e) => {
                tracing::error!("Failed to get config dir for watching: {}", e);
                return;
            }
        };

        if let Err(e) = debouncer
            .watcher()
            .watch(&config_path, RecursiveMode::NonRecursive)
        {
            tracing::error!("Failed to watch config file: {}", e);
            return;
        }

        for result in rx {
            match result {
                Ok(_events) => {
                    if let Ok(new_config) = AppConfig::load(&app_handle) {
                        tracing::info!("Config reloaded");
                        let _ = crate::utils::hotkeys::refresh_hotkeys(&app_handle);
                        app_handle.emit("config-updated", new_config).ok();
                    }
                }
                Err(e) => tracing::error!("Watch error: {:?}", e),
            }
        }
    });
}
