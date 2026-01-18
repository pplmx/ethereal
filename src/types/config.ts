export interface WindowConfig {
  default_x: number;
  default_y: number;
  always_on_top: boolean;
  target_monitor?: string;
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
  system_prompt: string;
  max_response_length: number;
  cooldown_seconds: number;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
}

export interface MoodConfig {
  boredom_threshold_cpu: number;
}

export interface HotkeyConfig {
  toggle_click_through: string;
  quit: string;
}

export interface NotificationConfig {
  enabled: boolean;
  notify_on_overheating: boolean;
  notify_on_angry: boolean;
}

export interface SleepConfig {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export interface AppConfig {
  window: WindowConfig;
  hardware: HardwareConfig;
  ai: AiConfig;
  sound: SoundConfig;
  mood: MoodConfig;
  hotkeys: HotkeyConfig;
  notifications: NotificationConfig;
  sleep: SleepConfig;
}
