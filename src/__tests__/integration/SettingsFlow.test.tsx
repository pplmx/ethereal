import { SettingsModal } from '@components/SettingsModal';
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

describe('Settings Flow Integration', () => {
  const mockConfig = {
    window: { default_x: 100, default_y: 100, always_on_top: true },
    hardware: {
      monitor_source: 'auto',
      polling_interval_ms: 2000,
      thresholds: { nvidia_temp: 80, amd_temp: 80, cpu_temp: 85 },
    },
    ai: {
      model_name: 'llama3.2',
      api_endpoint: 'http://localhost:11434',
      max_response_length: 100,
      cooldown_seconds: 30,
    },
    sound: {
      enabled: true,
      volume: 0.5,
    },
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

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: null, isOpen: true, isLoading: false });
    (invoke as Mock).mockImplementation((cmd) => {
      if (cmd === 'get_config') return Promise.resolve(mockConfig);
      if (cmd === 'get_monitors') return Promise.resolve([]);
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads config on open', async () => {
    render(<SettingsModal />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_config');
    });

    // Check if form is populated (Window tab is default)
    await waitFor(() => {
      expect(screen.getAllByDisplayValue('100')).toHaveLength(2); // X and Y
    });
  });

  it('updates config on save', async () => {
    render(<SettingsModal />);

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('100')).toHaveLength(2);
    });

    // Switch to AI tab
    fireEvent.click(screen.getByText('ai'));

    // Change model name - use findBy to wait for re-render
    const input = await screen.findByDisplayValue('llama3.2');
    fireEvent.change(input, { target: { value: 'gpt-4' } });

    // Click save
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('update_config', {
        config: expect.objectContaining({
          ai: expect.objectContaining({ model_name: 'gpt-4' }),
        }),
      });
    });
  });

  it('switches tabs correctly', async () => {
    render(<SettingsModal />);

    // Wait for config to load first
    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_config');
    });

    // Window tab by default
    expect(screen.getByText('Always On Top')).toBeInTheDocument();

    // Hardware tab
    fireEvent.click(screen.getByText('hardware'));
    await waitFor(() => {
      expect(screen.getByText('Monitor Source')).toBeInTheDocument();
    });

    // AI tab
    fireEvent.click(screen.getByText('ai'));
    await waitFor(() => {
      expect(screen.getByText('Model Name')).toBeInTheDocument();
    });
  });
});
