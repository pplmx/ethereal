#[cfg(test)]
mod tests {
    use crate::utils::display::MonitorInfo;

    #[test]
    fn test_monitor_info_serialization() {
        let info = MonitorInfo {
            name: Some("Test Monitor".to_string()),
            position: (0, 0),
            size: (1920, 1080),
            scale_factor: 1.0,
            is_primary: true,
        };

        let json = serde_json::to_string(&info).unwrap();
        assert!(json.contains("Test Monitor"));
        assert!(json.contains("is_primary\":true"));
    }
}
