import { SettingsModal } from '@components/SettingsModal';
import { useMonitorStore } from '@stores/monitorStore';
import { useSettingsStore } from '@stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

// Mock dependencies
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
  },
}));

describe('Settings Monitor Integration', () => {
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
      max_response_length: 100,
      cooldown_seconds: 30,
    },
    sound: { enabled: true, volume: 0.5 },
    mood: {
      boredom_threshold_cpu: 5.0,
    },
    hotkeys: {
      toggle_click_through: 'Ctrl+Shift+E',
      quit: 'Ctrl+Shift+Q',
    },
    notifications: {
      enabled: true,
      notify_on_overheating: true,
      notify_on_angry: true,
    },
    sleep: {
      enabled: false,
      start_time: '23:00',
      end_time: '07:00',
    },
    interaction: {
      double_click_action: 'chat',
      enable_hover_effects: true,
    },
    battery: {
      low_battery_threshold: 20.0,
      notify_on_low_battery: true,
    },
    autostart: {
      enabled: false,
    },
  };

  const mockMonitors = [
    { name: 'Display 1', position: [0, 0], size: [1920, 1080], scale_factor: 1, is_primary: true },
    {
      name: 'Display 2',
      position: [1920, 0],
      size: [1920, 1080],
      scale_factor: 1,
      is_primary: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: null, isOpen: true, isLoading: false });
    useMonitorStore.setState({ monitors: [], isLoading: false });

    (invoke as Mock).mockImplementation((cmd) => {
      if (cmd === 'get_config') return Promise.resolve(mockConfig);
      if (cmd === 'get_monitors') return Promise.resolve(mockMonitors);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads monitors on open', async () => {
    render(<SettingsModal />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_monitors');
    });

    await waitFor(() => {
      expect(screen.getByText('Monitor 1')).toBeInTheDocument();
      expect(screen.getByText('Monitor 2')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });
  });

  it('calls move_to_monitor when clicked', async () => {
    render(<SettingsModal />);

    await waitFor(() => {
      expect(screen.getByText('Monitor 2')).toBeInTheDocument();
    });

    const buttons = screen.getAllByText('Move Here');
    const targetButton = buttons[1];
    if (!targetButton) throw new Error('Target button not found');
    fireEvent.click(targetButton); // Click second monitor

    expect(invoke).toHaveBeenCalledWith('move_to_monitor', { monitorIndex: 1 });
  });
});
