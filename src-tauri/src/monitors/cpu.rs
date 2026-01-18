use crate::monitors::network::NetworkMonitor;
use crate::monitors::HardwareMonitor;
use std::sync::{Arc, Mutex};
use sysinfo::{Components, CpuRefreshKind, MemoryRefreshKind, RefreshKind, System, ProcessRefreshKind};

pub struct CpuMonitor {
    sys: Arc<Mutex<System>>,
    net: NetworkMonitor,
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
                .with_memory(MemoryRefreshKind::everything())
                .with_processes(ProcessRefreshKind::everything().with_disk_usage())
        );
        sys.refresh_cpu_usage();
        sys.refresh_memory();

        Self {
            sys: Arc::new(Mutex::new(sys)),
            net: NetworkMonitor::new(),
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

    fn get_network_usage(&self) -> (u64, u64) {
        self.net.get_usage()
    }

    fn get_disk_usage(&self) -> (u64, u64) {
        let mut sys = self.sys.lock().unwrap();
        sys.refresh_processes_specifics(
            sysinfo::ProcessesToUpdate::All,
            true,
            ProcessRefreshKind::new().with_disk_usage(),
        );

        let mut total_read = 0;
        let mut total_written = 0;
        
        for process in sys.processes().values() {
            let usage = process.disk_usage();
            total_read += usage.read_bytes;
            total_written += usage.written_bytes;
        }
        
        (total_read / 1024, total_written / 1024)
    }

    fn is_available(&self) -> bool {
        true
    }
}
