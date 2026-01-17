#[cfg(test)]
mod tests {

    use crate::monitors::mock::{ActivityPattern, MockDataGenerator};

    #[test]
    fn test_mock_gpu_data_generation() {
        let generator = MockDataGenerator::new(ActivityPattern::Idle);
        let data = generator.generate_gpu_data();

        assert!(data.temperature >= 30.0 && data.temperature < 45.0);
        assert!(data.utilization >= 0.0 && data.utilization < 10.0);
        assert!(data.memory_used >= 500 && data.memory_used < 1000);
    }

    #[test]
    fn test_mock_high_load_generation() {
        let generator = MockDataGenerator::new(ActivityPattern::HighLoad);
        let data = generator.generate_gpu_data();

        assert!(data.temperature >= 75.0 && data.temperature < 85.0);
        assert!(data.utilization >= 90.0 && data.utilization < 100.0);
        assert!(data.memory_used >= 15000 && data.memory_used < 20000);
    }
}
