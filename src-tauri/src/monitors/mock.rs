use rand::Rng;
use crate::monitors::HardwareMonitor;

#[cfg(test)]
#[path = "mock_test.rs"]
mod mock_test;

#[derive(Debug, Clone, Copy)]
pub enum ActivityPattern {
    Idle,
    HighLoad,
    Fluctuating,
}

pub struct MockDataGenerator {
    pattern: ActivityPattern,
}

#[derive(Debug, Clone)]
pub struct GpuData {
    pub temperature: f32,
    pub utilization: f32,
    pub memory_used: u64,
    pub memory_total: u64,
}

impl MockDataGenerator {
    pub fn new(pattern: ActivityPattern) -> Self {
        Self { pattern }
    }

    pub fn generate_gpu_data(&self) -> GpuData {
        let mut rng = rand::thread_rng();
        match self.pattern {
            ActivityPattern::Idle => GpuData {
                temperature: rng.gen_range(30.0..45.0),
                utilization: rng.gen_range(0.0..10.0),
                memory_used: rng.gen_range(500..1000),
                memory_total: 24576,
            },
            ActivityPattern::HighLoad => GpuData {
                temperature: rng.gen_range(75.0..85.0),
                utilization: rng.gen_range(90.0..100.0),
                memory_used: rng.gen_range(15000..20000),
                memory_total: 24576,
            },
            ActivityPattern::Fluctuating => GpuData {
                temperature: rng.gen_range(40.0..80.0),
                utilization: rng.gen_range(10.0..90.0),
                memory_used: rng.gen_range(2000..12000),
                memory_total: 24576,
            },
        }
    }
}

impl HardwareMonitor for MockDataGenerator {
    fn get_temperature(&self) -> f32 {
        self.generate_gpu_data().temperature
    }

    fn get_utilization(&self) -> f32 {
        self.generate_gpu_data().utilization
    }

    fn get_memory_usage(&self) -> (u64, u64) {
        let data = self.generate_gpu_data();
        (data.memory_used, data.memory_total)
    }

    fn is_available(&self) -> bool {
        true
    }
}
