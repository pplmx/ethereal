use battery::Manager;

pub struct BatteryMonitor {
    // We don't store Manager here because it's not Send/Sync on Windows
}

impl BatteryMonitor {
    pub fn new() -> anyhow::Result<Self> {
        let _ =
            Manager::new().map_err(|e| anyhow::anyhow!("Failed to init battery manager: {}", e))?;
        Ok(Self {})
    }

    pub fn get_status(&self) -> (f32, String) {
        if let Ok(manager) = Manager::new() {
            if let Ok(mut batteries) = manager.batteries() {
                if let Some(Ok(battery)) = batteries.next() {
                    let percentage = battery.state_of_charge().value * 100.0;
                    let state = format!("{:?}", battery.state());
                    return (percentage, state);
                }
            }
        }
        (0.0, "Unknown".to_string())
    }
}
