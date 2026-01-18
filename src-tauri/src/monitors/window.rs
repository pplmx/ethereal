use active_win_pos_rs::get_active_window;

#[derive(Debug, Clone, PartialEq)]
pub enum AppCategory {
    Coding,
    Gaming,
    Browsing,
    Idle,
    Unknown,
}

pub struct WindowMonitor;

impl Default for WindowMonitor {
    fn default() -> Self {
        Self::new()
    }
}

impl WindowMonitor {
    pub fn new() -> Self {
        Self
    }

    pub fn get_active_app_category(&self) -> AppCategory {
        match get_active_window() {
            Ok(window) => Self::categorize_app(&window.app_name),
            Err(_) => AppCategory::Unknown,
        }
    }

    pub fn get_active_window_title(&self) -> String {
        match get_active_window() {
            Ok(window) => window.title,
            Err(_) => "Unknown".to_string(),
        }
    }

    pub fn categorize_app(process_name: &str) -> AppCategory {
        let name = process_name.to_lowercase();

        if name.contains("code")
            || name.contains("cursor")
            || name.contains("idea")
            || name.contains("studio")
            || name.contains("nvim")
            || name.contains("vim")
        {
            AppCategory::Coding
        } else if name.contains("chrome")
            || name.contains("firefox")
            || name.contains("edge")
            || name.contains("brave")
        {
            AppCategory::Browsing
        } else if name.contains("steam") || name.contains("game") {
            AppCategory::Gaming
        } else if name.contains("explorer") || name.contains("finder") {
            AppCategory::Idle
        } else {
            AppCategory::Unknown
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_categorize_coding() {
        assert_eq!(
            WindowMonitor::categorize_app("Code.exe"),
            AppCategory::Coding
        );
        assert_eq!(
            WindowMonitor::categorize_app("idea64.exe"),
            AppCategory::Coding
        );
        assert_eq!(WindowMonitor::categorize_app("nvim"), AppCategory::Coding);
    }

    #[test]
    fn test_categorize_browsing() {
        assert_eq!(
            WindowMonitor::categorize_app("chrome.exe"),
            AppCategory::Browsing
        );
        assert_eq!(
            WindowMonitor::categorize_app("firefox"),
            AppCategory::Browsing
        );
    }

    #[test]
    fn test_categorize_gaming() {
        assert_eq!(
            WindowMonitor::categorize_app("steam.exe"),
            AppCategory::Gaming
        );
        assert_eq!(
            WindowMonitor::categorize_app("my_game.exe"),
            AppCategory::Gaming
        );
    }

    #[test]
    fn test_categorize_idle() {
        assert_eq!(
            WindowMonitor::categorize_app("explorer.exe"),
            AppCategory::Idle
        );
    }

    #[test]
    fn test_categorize_unknown() {
        assert_eq!(
            WindowMonitor::categorize_app("random_app.exe"),
            AppCategory::Unknown
        );
    }
}
