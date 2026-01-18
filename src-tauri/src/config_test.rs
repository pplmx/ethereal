#[cfg(test)]
mod tests {
    use crate::config::AppConfig;

    #[test]
    fn test_default_config_values() {
        let config = AppConfig::default();

        assert_eq!(config.window.default_x, 100);
        assert_eq!(config.window.default_y, 100);
        assert!(config.window.always_on_top);

        assert_eq!(config.hardware.polling_interval_ms, 2000);
        assert_eq!(config.hardware.thresholds.nvidia_temp, 80.0);

        assert_eq!(config.ai.model_name, "llama3.2");
        assert!(config.sound.enabled);
    }

    #[test]
    fn test_config_serialization() {
        let config = AppConfig::default();
        let toml_string = toml::to_string(&config).unwrap();

        assert!(toml_string.contains("default_x = 100"));
        assert!(toml_string.contains("model_name = \"llama3.2\""));
        assert!(toml_string.contains("enabled = true"));
    }

    #[test]
    fn test_config_deserialization() {
        let toml_input = r#"
            [window]
            default_x = 500
            default_y = 500
            always_on_top = false
            
            [hardware]
            monitor_source = "nvidia"
            polling_interval_ms = 1000
            
            [hardware.thresholds]
            nvidia_temp = 75.0
            
            [ai]
            model_name = "test-model"
            api_endpoint = "http://test:1234"

            [sound]
            enabled = false
            volume = 0.8

            [mood]
            boredom_threshold_cpu = 10.0

            [hotkeys]
            toggle_click_through = "Ctrl+Alt+L"
            quit = "Ctrl+Alt+M"

            [notifications]
            enabled = true
            notify_on_overheating = true
            notify_on_angry = true

            [sleep]
            enabled = true
            start_time = "22:00"
            end_time = "06:00"

            [interaction]
            double_click_action = "settings"
            enable_hover_effects = false

            [battery]
            low_battery_threshold = 15.0
            notify_on_low_battery = false
        "#;

        let config: AppConfig = toml::from_str(toml_input).unwrap();

        assert_eq!(config.window.default_x, 500);
        assert_eq!(config.hardware.monitor_source, "nvidia");
        assert_eq!(config.hardware.thresholds.nvidia_temp, 75.0);
        assert_eq!(config.ai.model_name, "test-model");
        assert!(!config.sound.enabled);
        assert_eq!(config.sound.volume, 0.8);
        assert_eq!(config.mood.boredom_threshold_cpu, 10.0);
        assert_eq!(config.hotkeys.toggle_click_through, "Ctrl+Alt+L");
        assert!(config.notifications.enabled);
        assert!(config.sleep.enabled);
        assert_eq!(config.sleep.start_time, "22:00");
        assert_eq!(config.interaction.double_click_action, "settings");
        assert_eq!(config.battery.low_battery_threshold, 15.0);

        assert_eq!(config.hardware.thresholds.cpu_temp, 85.0);
    }
}
