#[cfg(test)]
mod tests {
    use crate::config::AppConfig;
    use crate::monitors::{
        state::{determine_mood, determine_state, Mood, SpriteState},
        window::AppCategory,
        HardwareMonitor,
    };

    struct MockMonitor {
        temp: f32,
        util: f32,
    }

    impl HardwareMonitor for MockMonitor {
        fn get_temperature(&self) -> f32 {
            self.temp
        }
        fn get_utilization(&self) -> f32 {
            self.util
        }
        fn get_memory_usage(&self) -> (u64, u64) {
            (0, 0)
        }
        fn get_network_usage(&self) -> (u64, u64) {
            (0, 0)
        }
        fn get_disk_usage(&self) -> (u64, u64) {
            (0, 0)
        }
        fn get_battery_status(&self) -> (f32, String) {
            (100.0, "Full".to_string())
        }
        fn is_available(&self) -> bool {
            true
        }
    }

    fn create_config(threshold: f32) -> AppConfig {
        let mut config = AppConfig::default();
        config.hardware.thresholds.nvidia_temp = threshold;
        config
    }

    #[test]
    fn test_overheating_priority() {
        let monitor = MockMonitor {
            temp: 90.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::Overheating);
    }

    #[test]
    fn test_high_load_priority() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 90.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_memory_pressure_high_load() {
        struct MemoryMonitor {
            used: u64,
            total: u64,
        }
        impl HardwareMonitor for MemoryMonitor {
            fn get_temperature(&self) -> f32 {
                40.0
            }
            fn get_utilization(&self) -> f32 {
                10.0
            }
            fn get_memory_usage(&self) -> (u64, u64) {
                (self.used, self.total)
            }
            fn get_network_usage(&self) -> (u64, u64) {
                (0, 0)
            }
            fn get_disk_usage(&self) -> (u64, u64) {
                (0, 0)
            }
            fn get_battery_status(&self) -> (f32, String) {
                (100.0, "Full".to_string())
            }
            fn is_available(&self) -> bool {
                true
            }
        }

        let monitor = MemoryMonitor {
            used: 950,
            total: 1000,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_high_network_load() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 3000, 0, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_high_disk_load() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 20000, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_coding_activity() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Coding, &config);
        assert_eq!(state, SpriteState::Working);
    }

    #[test]
    fn test_gaming_activity() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Gaming, &config);
        assert_eq!(state, SpriteState::Gaming);
    }

    #[test]
    fn test_idle_default() {
        let monitor = MockMonitor {
            temp: 60.0,
            util: 10.0,
        };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, 0, 0, AppCategory::Unknown, &config);
        assert_eq!(state, SpriteState::Idle);
    }

    #[test]
    fn test_determine_mood() {
        let config = AppConfig::default();

        assert_eq!(
            determine_mood(&SpriteState::Overheating, 50.0, &config),
            Mood::Angry
        );
        assert_eq!(
            determine_mood(&SpriteState::HighLoad, 90.0, &config),
            Mood::Tired
        );
        assert_eq!(
            determine_mood(&SpriteState::Idle, 1.0, &config),
            Mood::Bored
        );
        assert_eq!(
            determine_mood(&SpriteState::Idle, 10.0, &config),
            Mood::Happy
        );
    }
}
