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
