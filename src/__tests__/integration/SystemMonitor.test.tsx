import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSpriteStore } from '../../stores/spriteStore';

vi.mock('@components/DevTools', () => ({
  DevTools: () => <div data-testid="devtools" />,
}));

vi.mock('@components/SpriteAnimator', () => ({
  SpriteAnimator: () => <div data-testid="sprite-animator" />,
}));

vi.mock('@components/SpeechBubble', () => ({
  SpeechBubble: () => <div data-testid="speech-bubble" />,
}));

vi.mock('@components/SettingsModal', () => ({
  SettingsModal: () => <div data-testid="settings-modal" />,
}));

vi.mock('@hooks/useDraggable', () => ({
  useDraggable: () => ({ startDragging: vi.fn() }),
}));

vi.mock('@hooks/useWindowPosition', () => ({
  useWindowPosition: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

vi.mock('@lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('System Monitoring Integration', () => {
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
    autostart: { enabled: false },
    privacy: { share_window_title: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: mockConfig as any });

    (invoke as Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'get_config') return mockConfig;
      return null;
    });

    useSpriteStore.setState({
      state: 'idle',
      mood: 'happy',
      hardware: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates sprite state and mood on gpu-update event', async () => {
    let hardwareCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'gpu-update') {
        hardwareCallback = callback;
        return () => {};
      }
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('gpu-update', expect.any(Function));
    });

    expect(hardwareCallback).toBeDefined();

    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 60,
            utilization: 90,
            memory_used: 4000,
            memory_total: 8000,
            network_rx: 0,
            network_tx: 0,
            disk_read: 0,
            disk_write: 0,
            battery_level: 80,
            battery_state: 'Discharging',
            state: 'HighLoad',
            mood: 'Tired',
          },
        });
      }
    });

    await waitFor(() => {
      const state = useSpriteStore.getState();
      expect(state.state).toBe('high_load');
      expect(state.mood).toBe('tired');
      expect(state.hardware?.utilization).toBe(90);
      expect(state.hardware?.battery_level).toBe(80);
    });

    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 70,
            utilization: 50,
            memory_used: 4000,
            memory_total: 8000,
            network_rx: 0,
            network_tx: 0,
            disk_read: 0,
            disk_write: 0,
            battery_level: 100,
            battery_state: 'Full',
            state: 'Gaming',
            mood: 'Excited',
          },
        });
      }
    });

    await waitFor(() => {
      const state = useSpriteStore.getState();
      expect(state.state).toBe('gaming');
      expect(state.mood).toBe('excited');
    });
  });
});
