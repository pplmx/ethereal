use crate::config::ConfigState;
use crate::monitors::window::AppCategory;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};

pub struct LearningMonitor {
    app_handle: AppHandle,
    last_save: Arc<Mutex<Instant>>,
}

impl LearningMonitor {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            app_handle,
            last_save: Arc::new(Mutex::new(Instant::now())),
        }
    }

    pub fn track_interaction(&self) {
        let app_handle = self.app_handle.clone();
        let last_save = self.last_save.clone();

        std::thread::spawn(move || {
            if let Some(state) = app_handle.try_state::<ConfigState>() {
                if let Ok(mut config_guard) = state.0.write() {
                    if !config_guard.learning.enabled {
                        return;
                    }

                    config_guard.learning.interaction_count += 1;

                    // Periodically save to disk (every 5 minutes or so to avoid thrashing)
                    // For now, we rely on the user manually saving or app shutdown,
                    // but we could auto-save here if critical.
                    // Let's implement a simple throttle for saving.
                    let mut last = last_save.lock().unwrap();
                    if last.elapsed() > Duration::from_secs(300) {
                        if let Err(e) = config_guard.save(&app_handle) {
                            tracing::error!("Failed to auto-save learned preferences: {}", e);
                        } else {
                            *last = Instant::now();
                        }
                    }
                }
            }
        });
    }

    pub fn track_app_usage(&self, app_name: &str, _category: AppCategory) {
        // Only track if learning is enabled
        let app_handle = self.app_handle.clone();
        let app_name = app_name.to_string();

        std::thread::spawn(move || {
            if let Some(state) = app_handle.try_state::<ConfigState>() {
                if let Ok(mut config_guard) = state.0.write() {
                    if !config_guard.learning.enabled {
                        return;
                    }

                    let count = config_guard.learning.top_apps.entry(app_name).or_insert(0);
                    *count += 1;
                }
            }
        });
    }
}
