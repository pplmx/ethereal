use tauri::{AppHandle, Emitter};
use std::time::Duration;
use std::sync::{Arc, Mutex};
use arboard::Clipboard;

pub struct ClipboardMonitor {
    last_content: Arc<Mutex<String>>,
}

impl ClipboardMonitor {
    pub fn new() -> Self {
        Self {
            last_content: Arc::new(Mutex::new(String::new())),
        }
    }

    pub fn start_polling(&self, app: AppHandle) {
        let last_content = self.last_content.clone();
        
        std::thread::spawn(move || {
            let mut clipboard = match Clipboard::new() {
                Ok(cb) => cb,
                Err(e) => {
                    tracing::error!("Failed to initialize clipboard: {}", e);
                    return;
                }
            };

            loop {
                match clipboard.get_text() {
                    Ok(text) => {
                        let mut last = last_content.lock().unwrap();
                        if *last != text {
                            // Filter content (ignore short/long text)
                            if text.len() >= 10 && text.len() <= 1000 {
                                if let Err(e) = app.emit("clipboard-changed", &text) {
                                    tracing::error!("Failed to emit clipboard event: {}", e);
                                } else {
                                    tracing::info!("Clipboard changed (len: {})", text.len());
                                    *last = text;
                                }
                            }
                        }
                    },
                    Err(_) => {
                        // Ignore errors (empty clipboard, non-text content)
                    }
                }
                std::thread::sleep(Duration::from_millis(500));
            }
        });
    }
}
