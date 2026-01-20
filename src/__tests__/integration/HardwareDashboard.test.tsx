import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSpriteStore } from '../../stores/spriteStore';

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

describe('Hardware Dashboard Integration', () => {
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
    autostart: { enabled: false },
    privacy: { share_window_title: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: mockConfig as any });

    (invoke as Mock).mockImplementation(async (cmd) => {
      if (cmd === 'get_config') return mockConfig;
      return null;
    });

    useSpriteStore.setState({
      state: 'idle',
      hardware: null,
    });
    (vi.stubEnv as any)('DEV', 'true');
    (global.performance as any).memory = { usedJSHeapSize: 100 * 1024 * 1024 };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('displays real-time hardware and network data in DevTools', async () => {
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

    // Expand DevTools to see hardware data
    const devButton = screen.getByText('DEV');
    fireEvent.click(devButton);

    expect(hardwareCallback).toBeDefined();

    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 55,
            utilization: 42.5,
            memory_used: 4000,
            memory_total: 8000,
            network_rx: 123,
            network_tx: 45,
            disk_read: 10,
            disk_write: 5,
            battery_level: 80,
            battery_state: 'Discharging',
            state: 'Working',
            mood: 'Happy',
          },
        });
      }
    });

    expect(screen.getAllByText('CPU').length).toBeGreaterThan(0);
    expect(screen.getByText('43%')).toBeInTheDocument(); // toFixed(0)
    expect(screen.getByText(/↓123 ↑45/)).toBeInTheDocument();
    expect(screen.getByText('Working')).toBeInTheDocument();
  });
});
