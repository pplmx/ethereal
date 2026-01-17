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

impl WindowMonitor {
    pub fn new() -> Self {
        Self
    }

    pub fn get_active_app_category(&self) -> AppCategory {
        match get_active_window() {
            Ok(window) => {
                let process_name = window.app_name.to_lowercase();
                
                if process_name.contains("code") 
                   || process_name.contains("cursor") 
                   || process_name.contains("idea") 
                   || process_name.contains("studio") 
                   || process_name.contains("nvim")
                   || process_name.contains("vim")
                {
                    AppCategory::Coding
                } else if process_name.contains("chrome") 
                          || process_name.contains("firefox") 
                          || process_name.contains("edge") 
                          || process_name.contains("brave")
                {
                    AppCategory::Browsing
                } else if process_name.contains("steam") 
                          || process_name.contains("game")
                {
                    AppCategory::Gaming
                } else if process_name.contains("explorer") 
                          || process_name.contains("finder")
                {
                    AppCategory::Idle
                } else {
                    AppCategory::Unknown
                }
            },
            Err(_) => AppCategory::Unknown,
        }
    }
}
