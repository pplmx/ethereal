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
  listen: vi.fn().mockResolvedValue(() => {}),
}));

vi.mock('@lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Settings Form Interactions', () => {
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
    vi.clearAllMocks();
    useSettingsStore.setState({ config: null, isOpen: true, isLoading: false });
    useMonitorStore.setState({ monitors: [], isLoading: false });

    (invoke as Mock).mockImplementation(async (cmd) => {
      if (cmd === 'get_config') return mockConfig;
      if (cmd === 'get_monitors') return [];
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates notification toggles correctly', async () => {
    render(<SettingsModal />);

    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());

    fireEvent.click(screen.getByText('notifications'));

    const overheatingCheckbox = await screen.findByLabelText(/Notify on System Overheating/i);
    expect(overheatingCheckbox).toBeChecked();

    fireEvent.click(overheatingCheckbox);
    expect(overheatingCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith(
        'update_config',
        expect.objectContaining({
          config: expect.objectContaining({
            notifications: expect.objectContaining({
              notify_on_overheating: false,
            }),
          }),
        }),
      );
    });
  });

  it('updates sleep schedule correctly', async () => {
    render(<SettingsModal />);
    await waitFor(() => expect(screen.getByText('Settings')).toBeInTheDocument());

    fireEvent.click(screen.getByText('sleep'));

    const startInput = await screen.findByLabelText(/Start Time/i);
    fireEvent.change(startInput, { target: { value: '22:00' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith(
        'update_config',
        expect.objectContaining({
          config: expect.objectContaining({
            sleep: expect.objectContaining({
              start_time: '22:00',
            }),
          }),
        }),
      );
    });
  });
});
