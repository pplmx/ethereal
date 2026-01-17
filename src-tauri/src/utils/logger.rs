use std::fs;
use tauri::{AppHandle, Manager};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn init_logging(app: &AppHandle) {
    let log_dir = app.path().app_log_dir().unwrap_or_else(|_| {
        std::path::PathBuf::from("logs")
    });

    if let Err(e) = fs::create_dir_all(&log_dir) {
        eprintln!("Failed to create log directory: {}", e);
        return;
    }

    let file_appender = tracing_appender::rolling::daily(
        &log_dir,
        "ethereal.log",
    );

    let registry = tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ethereal_lib=debug,info".into()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_writer(file_appender)
                .with_ansi(false)
        )
        .with(tracing_subscriber::fmt::layer().with_writer(std::io::stdout));

    if let Err(e) = registry.try_init() {
        eprintln!("Failed to initialize logger: {}", e);
    } else {
        tracing::info!("Logging initialized at: {:?}", log_dir);
        init_panic_hook();
    }
}

fn init_panic_hook() {
    std::panic::set_hook(Box::new(|panic_info| {
        tracing::error!("App Panic: {:?}", panic_info);
    }));
}
