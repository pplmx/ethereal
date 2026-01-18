use crate::config::AppConfig;
use crate::monitors::{
    window::{AppCategory},
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
    network_rx: u64,
    network_tx: u64,
    app_category: AppCategory,
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

    if network_rx + network_tx > 2048 {
        return SpriteState::HighLoad;
    }

    match app_category {
        AppCategory::Coding => SpriteState::Working,
        AppCategory::Gaming => SpriteState::Gaming,
        AppCategory::Browsing => SpriteState::Browsing,
        _ => SpriteState::Idle,
    }
}

#[cfg(test)]
#[path = "state_test.rs"]
mod state_test;
