#[cfg(test)]
mod tests {
    use crate::monitors::{HardwareMonitor, state::{determine_state, SpriteState}, window::AppCategory};
    use crate::config::AppConfig;

    struct MockMonitor {
        temp: f32,
        util: f32,
    }

    impl HardwareMonitor for MockMonitor {
        fn get_temperature(&self) -> f32 { self.temp }
        fn get_utilization(&self) -> f32 { self.util }
        fn get_memory_usage(&self) -> (u64, u64) { (0, 0) }
        fn get_network_usage(&self) -> (u64, u64) { (0, 0) }
        fn is_available(&self) -> bool { true }
    }

    fn create_config(threshold: f32) -> AppConfig {
        let mut config = AppConfig::default();
        config.hardware.thresholds.nvidia_temp = threshold;
        config
    }

    #[test]
    fn test_overheating_priority() {
        let monitor = MockMonitor { temp: 90.0, util: 10.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::Overheating);
    }

    #[test]
    fn test_high_load_priority() {
        let monitor = MockMonitor { temp: 60.0, util: 90.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_high_network_load() {
        let monitor = MockMonitor { temp: 60.0, util: 10.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 3000, 0, AppCategory::Idle, &config);
        assert_eq!(state, SpriteState::HighLoad);
    }

    #[test]
    fn test_coding_activity() {
        let monitor = MockMonitor { temp: 60.0, util: 10.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, AppCategory::Coding, &config);
        assert_eq!(state, SpriteState::Working);
    }

    #[test]
    fn test_gaming_activity() {
        let monitor = MockMonitor { temp: 60.0, util: 10.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, AppCategory::Gaming, &config);
        assert_eq!(state, SpriteState::Gaming);
    }

    #[test]
    fn test_idle_default() {
        let monitor = MockMonitor { temp: 60.0, util: 10.0 };
        let config = create_config(80.0);
        let state = determine_state(&monitor, 0, 0, AppCategory::Unknown, &config);
        assert_eq!(state, SpriteState::Idle);
    }
}
