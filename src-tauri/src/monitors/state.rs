use crate::config::AppConfig;
use crate::monitors::{window::AppCategory, HardwareMonitor};

use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum SpriteState {
    Overheating,
    HighLoad,
    Working,
    Gaming,
    Browsing,
    Idle,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum Mood {
    Happy,
    Excited,
    Tired,
    Bored,
    Angry,
}

pub fn determine_mood(state: &SpriteState, usage: f32) -> Mood {
    match state {
        SpriteState::Overheating => Mood::Angry,
        SpriteState::HighLoad => Mood::Tired,
        SpriteState::Gaming => Mood::Excited,
        SpriteState::Working => Mood::Happy,
        _ => {
            if usage < 5.0 {
                Mood::Bored
            } else {
                Mood::Happy
            }
        }
    }
}

pub fn determine_state(
    monitor: &dyn HardwareMonitor,
    network_rx: u64,
    network_tx: u64,
    disk_read: u64,
    disk_write: u64,
    app_category: AppCategory,
    config: &AppConfig,
) -> SpriteState {
    let temp = monitor.get_temperature();
    let usage = monitor.get_utilization();
    let (mem_used, mem_total) = monitor.get_memory_usage();
    let mem_pressure = if mem_total > 0 {
        (mem_used as f32 / mem_total as f32) * 100.0
    } else {
        0.0
    };

    if temp > config.hardware.thresholds.nvidia_temp {
        return SpriteState::Overheating;
    }

    if usage > 80.0 || mem_pressure > 90.0 {
        return SpriteState::HighLoad;
    }

    if network_rx + network_tx > 2048 || disk_read + disk_write > 10240 {
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
