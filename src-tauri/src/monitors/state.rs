use crate::config::AppConfig;
use crate::monitors::{window::AppCategory, HardwareMonitor};
use chrono::{Local, NaiveTime};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum SpriteState {
    Overheating,
    HighLoad,
    Working,
    Gaming,
    Browsing,
    Idle,
    Sleeping,
    LowBattery,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum Mood {
    Happy,
    Excited,
    Tired,
    Bored,
    Angry,
    Sad,
}

pub fn is_within_sleep_time(start: &str, end: &str) -> bool {
    let now = Local::now().time();
    let start_time = NaiveTime::parse_from_str(start, "%H:%M")
        .unwrap_or_else(|_| NaiveTime::from_hms_opt(23, 0, 0).unwrap());
    let end_time = NaiveTime::parse_from_str(end, "%H:%M")
        .unwrap_or_else(|_| NaiveTime::from_hms_opt(7, 0, 0).unwrap());

    if start_time < end_time {
        now >= start_time && now <= end_time
    } else {
        now >= start_time || now <= end_time
    }
}

pub fn determine_mood(state: &SpriteState, usage: f32, config: &AppConfig) -> Mood {
    match state {
        SpriteState::Overheating => Mood::Angry,
        SpriteState::HighLoad => Mood::Tired,
        SpriteState::Gaming => Mood::Excited,
        SpriteState::Working => Mood::Happy,
        SpriteState::Sleeping => Mood::Bored,
        SpriteState::LowBattery => Mood::Sad,
        _ => {
            if usage < config.mood.boredom_threshold_cpu {
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
    let (bat_lvl, _bat_state) = monitor.get_battery_status();

    let mem_pressure = if mem_total > 0 {
        (mem_used as f32 / mem_total as f32) * 100.0
    } else {
        0.0
    };

    if temp > config.hardware.thresholds.nvidia_temp {
        return SpriteState::Overheating;
    }

    if config.sleep.enabled
        && is_within_sleep_time(&config.sleep.start_time, &config.sleep.end_time)
    {
        return SpriteState::Sleeping;
    }

    if bat_lvl > 0.0 && bat_lvl < config.battery.low_battery_threshold && _bat_state != "Charging" {
        return SpriteState::LowBattery;
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
