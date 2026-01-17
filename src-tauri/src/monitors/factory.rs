use crate::monitors::{HardwareMonitor, cpu::CpuMonitor, mock::{MockDataGenerator, ActivityPattern}};

pub fn create_monitor() -> Box<dyn HardwareMonitor> {
    if cfg!(debug_assertions) {
        if std::env::var("ETHEREAL_USE_MOCK").is_ok() {
             return Box::new(MockDataGenerator::new(ActivityPattern::Fluctuating));
        }
        Box::new(CpuMonitor::new())
    } else {
        Box::new(CpuMonitor::new())
    }
}
