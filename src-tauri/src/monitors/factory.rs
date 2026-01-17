use crate::monitors::{
    cpu::CpuMonitor,
    mock::{ActivityPattern, MockDataGenerator},
    HardwareMonitor,
};

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
