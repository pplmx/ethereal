use battery::Manager;

pub struct BatteryMonitor {
    // Note: Manager uses Rc internally on Windows, so it cannot be stored
    // in a Send+Sync struct. We recreate it on each call instead.
}

impl BatteryMonitor {
    pub fn new() -> anyhow::Result<Self> {
        // Verify battery monitoring is available on this system
        let _ =
            Manager::new().map_err(|e| anyhow::anyhow!("Failed to init battery manager: {}", e))?;
        Ok(Self {})
    }

    pub fn get_status(&self) -> (f32, String) {
        // Recreate Manager each time since it uses Rc (not Send on Windows)
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
