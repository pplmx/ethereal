use rand::Rng;

#[cfg(test)]
#[path = "mock_test.rs"]
mod mock_test;

#[derive(Debug, Clone, Copy)]
pub enum ActivityPattern {
    Idle,
    HighLoad,
    Fluctuating,
}

#[cfg(debug_assertions)]
pub struct MockDataGenerator {
    pattern: ActivityPattern,
}

#[cfg(debug_assertions)]
#[derive(Debug, Clone)]
pub struct GpuData {
    pub temperature: f32,
    pub utilization: f32,
    pub memory_used: u64,
    pub memory_total: u64,
}

#[cfg(debug_assertions)]
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
