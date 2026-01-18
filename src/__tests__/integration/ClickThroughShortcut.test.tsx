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
  },
}));

describe('Click-through Shortcut Integration', () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: mockConfig as any });
    useSpriteStore.setState({
      isClickThrough: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles click-through state and calls backend when shortcut event received', async () => {
    let shortcutCallback: (() => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'toggle-click-through-request') {
        shortcutCallback = callback;
        return () => {};
      }
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('toggle-click-through-request', expect.any(Function));
    });

    expect(shortcutCallback).toBeDefined();

    await act(async () => {
      if (shortcutCallback) {
        await shortcutCallback();
      }
    });

    expect(invoke).toHaveBeenCalledWith('set_click_through', { enabled: true });

    expect(useSpriteStore.getState().isClickThrough).toBe(true);

    await act(async () => {
      if (shortcutCallback) {
        await shortcutCallback();
      }
    });

    expect(invoke).toHaveBeenCalledWith('set_click_through', { enabled: false });
    expect(useSpriteStore.getState().isClickThrough).toBe(false);
  });
});
