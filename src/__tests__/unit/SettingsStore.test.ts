import { invoke } from '@tauri-apps/api/core';
import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

describe('SettingsStore', () => {
  const mockConfig = {
    window: { default_x: 100, default_y: 100, always_on_top: true },
    hardware: {
      monitor_source: 'auto',
      polling_interval_ms: 2000,
      thresholds: { nvidia_temp: 80, amd_temp: 80, cpu_temp: 85 },
    },
    ai: {
      model_name: 'llama3.2',
      api_endpoint: '',
      system_prompt: '',
      max_response_length: 100,
      cooldown_seconds: 30,
    },
    sound: { enabled: true, volume: 0.5 },
    mood: { boredom_threshold_cpu: 5.0 },
    hotkeys: { toggle_click_through: 'Ctrl+Shift+E', quit: 'Ctrl+Shift+Q' },
    notifications: { enabled: true, notify_on_overheating: true, notify_on_angry: true },
    sleep: { enabled: false, start_time: '23:00', end_time: '07:00' },
    interaction: { double_click_action: 'chat', enable_hover_effects: true },
    battery: { low_battery_threshold: 20.0, notify_on_low_battery: true },
  };

  beforeEach(() => {
    useSettingsStore.setState({
      config: null,
      isOpen: false,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('loads config via invoke', async () => {
    (invoke as Mock).mockResolvedValue(mockConfig);

    await act(async () => {
      await useSettingsStore.getState().loadConfig();
    });

    expect(invoke).toHaveBeenCalledWith('get_config');
    expect(useSettingsStore.getState().config).toEqual(mockConfig);
  });

  it('updates config via invoke', async () => {
    (invoke as Mock).mockResolvedValue(null);

    await act(async () => {
      await useSettingsStore.getState().updateConfig(mockConfig as any);
    });

    expect(invoke).toHaveBeenCalledWith('update_config', { config: mockConfig });
    expect(useSettingsStore.getState().config).toEqual(mockConfig);
  });

  it('toggles open state', () => {
    act(() => {
      useSettingsStore.getState().setIsOpen(true);
    });
    expect(useSettingsStore.getState().isOpen).toBe(true);
  });
});
