use crate::monitors::{HardwareMonitor, cpu::CpuMonitor};

pub fn create_monitor() -> Box<dyn HardwareMonitor> {
    if cfg!(debug_assertions) {
        Box::new(CpuMonitor::new())
    } else {
        Box::new(CpuMonitor::new())
    }
}
