pub mod battery;
pub mod clipboard;
pub mod cpu;
pub mod factory;
pub mod mock;
pub mod network;
pub mod state;
pub mod window;

pub trait HardwareMonitor: Send + Sync {
    fn get_temperature(&self) -> f32;
    fn get_utilization(&self) -> f32;
    fn get_memory_usage(&self) -> (u64, u64);
    fn get_network_usage(&self) -> (u64, u64);
    fn get_disk_usage(&self) -> (u64, u64);
    fn get_battery_status(&self) -> (f32, String);
    fn is_available(&self) -> bool;
}

use crate::config::AppConfig;
use crate::monitors::factory::create_monitor;
use crate::monitors::state::{determine_mood, determine_state, Mood, SpriteState};
use crate::monitors::window::WindowMonitor;
use crate::utils::notification::send_notification;
use serde::Serialize;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Clone, Serialize)]
struct GpuStats {
    temperature: f32,
    utilization: f32,
    memory_used: u64,
    memory_total: u64,
    network_rx: u64,
    network_tx: u64,
    disk_read: u64,
    disk_write: u64,
    battery_level: f32,
    battery_state: String,
    active_window: String,
    state: String,
    mood: String,
}

pub fn spawn_monitor_thread(app: AppHandle) {
    std::thread::spawn(move || {
        let monitor = create_monitor();
        let window_monitor = WindowMonitor::new();
        let mut last_overheat_notif = Instant::now() - Duration::from_secs(300);
        let mut last_angry_notif = Instant::now() - Duration::from_secs(300);
        let mut last_low_battery_notif = Instant::now() - Duration::from_secs(300);

        loop {
            let mut sleep_ms = 2000;

            if monitor.is_available() {
                // Use cached config from state
                let config = if let Some(state) = app.try_state::<crate::config::ConfigState>() {
                    state.0.read().unwrap().clone()
                } else {
                    AppConfig::load(&app).unwrap_or_default()
                };

                sleep_ms = config.hardware.polling_interval_ms;

                let (used, total) = monitor.get_memory_usage();
                let (rx, tx) = monitor.get_network_usage();
                let (read, write) = monitor.get_disk_usage();
                let (bat_lvl, bat_state) = monitor.get_battery_status();
                let category = window_monitor.get_active_app_category();
                let window_title = if config.privacy.share_window_title {
                    window_monitor.get_active_window_title()
                } else {
                    "Hidden (Privacy)".to_string()
                };

                let state =
                    determine_state(monitor.as_ref(), rx, tx, read, write, category, &config);
                let mood = determine_mood(&state, monitor.get_utilization(), &config);

                // Adaptive polling based on state
                match state {
                    SpriteState::Sleeping => sleep_ms = 10000, // 10s when sleeping
                    SpriteState::Idle => sleep_ms = 5000,      // 5s when idle
                    SpriteState::LowBattery => sleep_ms = 5000, // 5s to save energy
                    _ => {}
                }

                if config.notifications.enabled {
                    if state == SpriteState::Overheating
                        && config.notifications.notify_on_overheating
                        && last_overheat_notif.elapsed() > Duration::from_secs(300)
                    {
                        send_notification(
                            &app,
                            "Ethereal: Hot Hot Hot!",
                            "The system is getting too hot. I'm melting!",
                        );
                        last_overheat_notif = Instant::now();
                    }

                    if mood == Mood::Angry
                        && config.notifications.notify_on_angry
                        && last_angry_notif.elapsed() > Duration::from_secs(300)
                    {
                        send_notification(
                            &app,
                            "Ethereal is Angry",
                            "Stop pushing the system so hard! I need a break.",
                        );
                        last_angry_notif = Instant::now();
                    }

                    if state == SpriteState::LowBattery
                        && config.battery.notify_on_low_battery
                        && last_low_battery_notif.elapsed() > Duration::from_secs(300)
                    {
                        send_notification(
                            &app,
                            "Ethereal is Fading",
                            "I'm feeling very weak... please plug in the charger.",
                        );
                        last_low_battery_notif = Instant::now();
                    }
                }

                let stats = GpuStats {
                    temperature: monitor.get_temperature(),
                    utilization: monitor.get_utilization(),
                    memory_used: used,
                    memory_total: total,
                    network_rx: rx,
                    network_tx: tx,
                    disk_read: read,
                    disk_write: write,
                    battery_level: bat_lvl,
                    battery_state: bat_state,
                    active_window: window_title,
                    state: format!("{:?}", state),
                    mood: format!("{:?}", mood),
                };

                if let Err(e) = app.emit("gpu-update", stats) {
                    tracing::error!("Failed to emit gpu-update: {}", e);
                }
            }
            std::thread::sleep(Duration::from_millis(sleep_ms));
        }
    });
}
