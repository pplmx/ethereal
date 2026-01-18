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

describe('Settings Sound Integration', () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: null, isOpen: true, isLoading: false });
    (invoke as Mock).mockImplementation((cmd) => {
      if (cmd === 'get_config') return Promise.resolve(mockConfig);
      if (cmd === 'get_monitors') return Promise.resolve([]); // Return empty array for monitors
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates sound settings on save', async () => {
    render(<SettingsModal />);

    // Wait for modal to render (it depends on config loading)
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Switch to Sound tab
    fireEvent.click(screen.getByText('sound'));

    // Toggle enabled checkbox
    const checkbox = await screen.findByRole('checkbox', { name: /enable sound/i });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Change volume
    // Implicit role for type="range" might vary, let's verify
    // Using simple input finding for range
    const range = screen.getByRole('slider');
    fireEvent.change(range, { target: { value: '0.8' } });

    // Click save
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('update_config', {
        config: expect.objectContaining({
          sound: {
            enabled: false,
            volume: 0.8,
          },
        }),
      });
    });
  });
});
