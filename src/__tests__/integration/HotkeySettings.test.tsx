import { SettingsModal } from '@components/SettingsModal';
import { useMonitorStore } from '@stores/monitorStore';
import { useSettingsStore } from '@stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

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

describe('Hotkey Settings Integration', () => {
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
    mood: { boredom_threshold_cpu: 5.0 },
    hotkeys: { toggle_click_through: 'Ctrl+Shift+E', quit: 'Ctrl+Shift+Q' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: null, isOpen: true, isLoading: false });
    useMonitorStore.setState({ monitors: [], isLoading: false });

    (invoke as Mock).mockImplementation((cmd) => {
      if (cmd === 'get_config') return Promise.resolve(mockConfig);
      if (cmd === 'get_monitors') return Promise.resolve([]);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('allows changing hotkeys in settings', async () => {
    render(<SettingsModal />);

    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());

    fireEvent.click(screen.getByText('hotkeys'));

    const input = await screen.findByDisplayValue('Ctrl+Shift+E');
    fireEvent.change(input, { target: { value: 'Ctrl+Alt+K' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('update_config', {
        config: expect.objectContaining({
          hotkeys: expect.objectContaining({
            toggle_click_through: 'Ctrl+Alt+K',
          }),
        }),
      });
    });
  });
});
