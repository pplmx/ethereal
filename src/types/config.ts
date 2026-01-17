export interface WindowConfig {
  default_x: number;
  default_y: number;
  always_on_top: boolean;
}

export interface ThresholdsConfig {
  nvidia_temp: number;
  amd_temp: number;
  cpu_temp: number;
}

export interface HardwareConfig {
  monitor_source: string;
  polling_interval_ms: number;
  thresholds: ThresholdsConfig;
}

export interface AiConfig {
  model_name: string;
  api_endpoint: string;
  max_response_length: number;
  cooldown_seconds: number;
}

export interface AppConfig {
  window: WindowConfig;
  hardware: HardwareConfig;
  ai: AiConfig;
}
