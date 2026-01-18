use std::sync::{Arc, Mutex};
use std::time::Instant;
use sysinfo::Networks;

pub struct NetworkMonitor {
    networks: Arc<Mutex<Networks>>,
    last_update: Arc<Mutex<Instant>>,
    last_data: Arc<Mutex<(u64, u64)>>,
}

impl Default for NetworkMonitor {
    fn default() -> Self {
        Self::new()
    }
}

impl NetworkMonitor {
    pub fn new() -> Self {
        let mut networks = Networks::new_with_refreshed_list();
        networks.refresh_list();

        Self {
            networks: Arc::new(Mutex::new(networks)),
            last_update: Arc::new(Mutex::new(Instant::now())),
            last_data: Arc::new(Mutex::new((0, 0))),
        }
    }

    pub fn get_usage(&self) -> (u64, u64) {
        let mut networks = self.networks.lock().unwrap();
        let mut last_update = self.last_update.lock().unwrap();
        let mut last_data = self.last_data.lock().unwrap();

        networks.refresh();
        let now = Instant::now();
        let duration = now.duration_since(*last_update).as_secs_f64();

        let mut current_rx = 0;
        let mut current_tx = 0;

        for (_interface_name, network) in networks.iter() {
            current_rx += network.received();
            current_tx += network.transmitted();
        }

        let rx_speed = if duration > 0.0 {
            ((current_rx.saturating_sub(last_data.0)) as f64 / 1024.0 / duration) as u64
        } else {
            0
        };

        let tx_speed = if duration > 0.0 {
            ((current_tx.saturating_sub(last_data.1)) as f64 / 1024.0 / duration) as u64
        } else {
            0
        };

        *last_update = now;
        *last_data = (current_rx, current_tx);

        (rx_speed, tx_speed)
    }
}
