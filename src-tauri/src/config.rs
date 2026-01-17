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
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct WindowConfig {
    #[serde(default = "default_x")]
    pub default_x: i32,
    #[serde(default = "default_y")]
    pub default_y: i32,
    #[serde(default = "default_on_top")]
    pub always_on_top: bool,
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
    #[serde(default = "default_max_length")]
    pub max_response_length: usize,
    #[serde(default = "default_cooldown")]
    pub cooldown_seconds: u64,
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
fn default_max_length() -> usize {
    100
}
fn default_cooldown() -> u64 {
    30
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

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            window: WindowConfig {
                default_x: default_x(),
                default_y: default_y(),
                always_on_top: default_on_top(),
            },
            hardware: HardwareConfig {
                monitor_source: default_monitor_source(),
                polling_interval_ms: default_polling_interval(),
                thresholds: ThresholdsConfig::default(),
            },
            ai: AiConfig {
                model_name: default_model(),
                api_endpoint: default_api_endpoint(),
                max_response_length: default_max_length(),
                cooldown_seconds: default_cooldown(),
            },
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
                        app_handle.emit("config-updated", new_config).ok();
                    }
                }
                Err(e) => tracing::error!("Watch error: {:?}", e),
            }
        }
    });
}
