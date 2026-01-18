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
    fn is_available(&self) -> bool;
}

use crate::config::AppConfig;
use crate::monitors::factory::create_monitor;
use crate::monitors::state::determine_state;
use crate::monitors::window::WindowMonitor;
use serde::Serialize;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

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
    state: String,
}

pub fn spawn_monitor_thread(app: AppHandle) {
    std::thread::spawn(move || {
        let monitor = create_monitor();
        let window_monitor = WindowMonitor::new();

        loop {
            if monitor.is_available() {
                let config = AppConfig::load(&app).unwrap_or_default();

                let (used, total) = monitor.get_memory_usage();
                let (rx, tx) = monitor.get_network_usage();
                let (read, write) = monitor.get_disk_usage();
                let category = window_monitor.get_active_app_category();
                let state = determine_state(monitor.as_ref(), rx, tx, read, write, category, &config);

                let stats = GpuStats {
                    temperature: monitor.get_temperature(),
                    utilization: monitor.get_utilization(),
                    memory_used: used,
                    memory_total: total,
                    network_rx: rx,
                    network_tx: tx,
                    disk_read: read,
                    disk_write: write,
                    state: format!("{:?}", state),
                };

                if let Err(e) = app.emit("gpu-update", stats) {
                    tracing::error!("Failed to emit gpu-update: {}", e);
                }
            }
            std::thread::sleep(Duration::from_millis(2000));
        }
    });
}
