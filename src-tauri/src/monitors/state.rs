use crate::config::AppConfig;
use crate::monitors::{
    window::{AppCategory, WindowMonitor},
    HardwareMonitor,
};

#[derive(Debug, Clone, PartialEq)]
pub enum SpriteState {
    Overheating,
    HighLoad,
    Working,
    Gaming,
    Browsing,
    Idle,
}

pub fn determine_state(
    monitor: &dyn HardwareMonitor,
    window_monitor: &WindowMonitor,
    config: &AppConfig,
) -> SpriteState {
    let temp = monitor.get_temperature();
    let usage = monitor.get_utilization();

    if temp > config.hardware.thresholds.nvidia_temp {
        return SpriteState::Overheating;
    }

    if usage > 80.0 {
        return SpriteState::HighLoad;
    }

    match window_monitor.get_active_app_category() {
        AppCategory::Coding => SpriteState::Working,
        AppCategory::Gaming => SpriteState::Gaming,
        AppCategory::Browsing => SpriteState::Browsing,
        _ => SpriteState::Idle,
    }
}
