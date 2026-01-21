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

    /// Track a user interaction (e.g., chat message).
    /// Performs direct state update without spawning a thread.
    pub fn track_interaction(&self) {
        if let Some(state) = self.app_handle.try_state::<ConfigState>() {
            if let Ok(mut config_guard) = state.0.write() {
                if !config_guard.learning.enabled {
                    return;
                }

                config_guard.learning.interaction_count += 1;
                self.maybe_auto_save(&config_guard);
            }
        }
    }

    /// Track app usage based on active window.
    /// Performs direct state update without spawning a thread.
    pub fn track_app_usage(&self, app_name: &str, _category: AppCategory) {
        if let Some(state) = self.app_handle.try_state::<ConfigState>() {
            if let Ok(mut config_guard) = state.0.write() {
                if !config_guard.learning.enabled {
                    return;
                }

                let count = config_guard
                    .learning
                    .top_apps
                    .entry(app_name.to_string())
                    .or_insert(0);
                *count += 1;
            }
        }
    }

    /// Auto-save learned preferences every 5 minutes to avoid thrashing disk.
    fn maybe_auto_save(&self, config: &crate::config::AppConfig) {
        let mut last = self.last_save.lock().unwrap();
        if last.elapsed() > Duration::from_secs(300) {
            if let Err(e) = config.save(&self.app_handle) {
                tracing::error!("Failed to auto-save learned preferences: {}", e);
            } else {
                *last = Instant::now();
            }
        }
    }
}
