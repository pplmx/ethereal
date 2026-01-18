use tauri_plugin_notification::NotificationExt;

pub trait NotificationManager: Send + Sync {
    fn notify(&self, app: &tauri::AppHandle, title: &str, body: &str);
}

pub struct SystemNotificationManager;

impl NotificationManager for SystemNotificationManager {
    fn notify(&self, app: &tauri::AppHandle, title: &str, body: &str) {
        let _ = app.notification().builder().title(title).body(body).show();
    }
}

pub fn send_notification(app: &tauri::AppHandle, title: &str, body: &str) {
    let manager = SystemNotificationManager;
    manager.notify(app, title, body);
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};

    struct MockNotificationManager {
        calls: Arc<Mutex<Vec<(String, String)>>>,
    }

    impl NotificationManager for MockNotificationManager {
        fn notify(&self, _app: &tauri::AppHandle, title: &str, body: &str) {
            let mut calls = self.calls.lock().unwrap();
            calls.push((title.to_string(), body.to_string()));
        }
    }

    #[test]
    fn test_notification_manager_trait() {
        let calls = Arc::new(Mutex::new(Vec::new()));
        let _manager = MockNotificationManager {
            calls: calls.clone(),
        };
    }
}
