use crate::monitors::HardwareMonitor;
use std::sync::{Arc, Mutex};
use sysinfo::{Components, CpuRefreshKind, MemoryRefreshKind, RefreshKind, System};

pub struct CpuMonitor {
    sys: Arc<Mutex<System>>,
}

impl Default for CpuMonitor {
    fn default() -> Self {
        Self::new()
    }
}

impl CpuMonitor {
    pub fn new() -> Self {
        let mut sys = System::new_with_specifics(
            RefreshKind::new()
                .with_cpu(CpuRefreshKind::everything())
                .with_memory(MemoryRefreshKind::everything()),
        );
        sys.refresh_cpu_usage();
        sys.refresh_memory();

        Self {
            sys: Arc::new(Mutex::new(sys)),
        }
    }
}

impl HardwareMonitor for CpuMonitor {
    fn get_temperature(&self) -> f32 {
        let components = Components::new_with_refreshed_list();

        let mut sum = 0.0;
        let mut count = 0;

        for component in &components {
            let label = component.label().to_lowercase();
            if label.contains("cpu") || label.contains("package") || label.contains("core") {
                sum += component.temperature();
                count += 1;
            }
        }

        if count > 0 {
            sum / count as f32
        } else {
            0.0
        }
    }

    fn get_utilization(&self) -> f32 {
        let mut sys = self.sys.lock().unwrap();
        sys.refresh_cpu_usage();
        sys.global_cpu_usage()
    }

    fn get_memory_usage(&self) -> (u64, u64) {
        let mut sys = self.sys.lock().unwrap();
        sys.refresh_memory();
        (
            sys.used_memory() / 1024 / 1024,
            sys.total_memory() / 1024 / 1024,
        )
    }

    fn is_available(&self) -> bool {
        true
    }
}
