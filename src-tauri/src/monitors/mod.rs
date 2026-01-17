pub mod mock;
pub mod cpu;
pub mod factory;

pub trait HardwareMonitor: Send + Sync {
    fn get_temperature(&self) -> f32;
    fn get_utilization(&self) -> f32;
    fn get_memory_usage(&self) -> (u64, u64);
    fn is_available(&self) -> bool;
}

use tauri::{AppHandle, Emitter};
use std::time::Duration;
use crate::monitors::factory::create_monitor;
use serde::Serialize;

#[derive(Clone, Serialize)]
struct GpuStats {
    temperature: f32,
    utilization: f32,
    memory_used: u64,
    memory_total: u64,
}

pub fn spawn_monitor_thread(app: AppHandle) {
    std::thread::spawn(move || {
        let monitor = create_monitor();
        loop {
            if monitor.is_available() {
                let (used, total) = monitor.get_memory_usage();
                let stats = GpuStats {
                    temperature: monitor.get_temperature(),
                    utilization: monitor.get_utilization(),
                    memory_used: used,
                    memory_total: total,
                };
                
                if let Err(e) = app.emit("gpu-update", stats) {
                    tracing::error!("Failed to emit gpu-update: {}", e);
                }
            }
            std::thread::sleep(Duration::from_millis(2000));
        }
    });
}
