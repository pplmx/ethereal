import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useSettingsStore } from '../../stores/settingsStore';

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

vi.mock('@components/StateOverlay', () => ({
  StateOverlay: () => <div data-testid="state-overlay" />,
}));

vi.mock('@hooks/useDraggable', () => ({
  useDraggable: () => ({ startDragging: vi.fn() }),
}));

vi.mock('@hooks/useWindowPosition', () => ({
  useWindowPosition: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  isTauri: vi.fn().mockReturnValue(false),
  convertFileSrc: vi.fn((path) => `asset://${path}`),
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

describe('Drag and Drop Integration', () => {
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
    interaction: {
      double_click_action: 'chat',
      enable_hover_effects: true,
      custom_sprite_path: '',
    },
    battery: { low_battery_threshold: 20.0, notify_on_low_battery: true },
    autostart: { enabled: false },
    privacy: { share_window_title: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      config: JSON.parse(JSON.stringify(mockConfig)),
      isOpen: false,
    });

    (invoke as Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'get_config') return mockConfig;
      if (cmd === 'update_config') return null;
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates custom_sprite_path when a directory is dropped', async () => {
    let dragDropCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'tauri://drag-drop') {
        dragDropCallback = callback;
      }
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('tauri://drag-drop', expect.any(Function));
    });

    expect(dragDropCallback).toBeDefined();

    await act(async () => {
      if (dragDropCallback) {
        dragDropCallback({ payload: ['C:\\Users\\pplmx\\Sprites'] });
      }
    });

    expect(invoke).toHaveBeenCalledWith(
      'update_config',
      expect.objectContaining({
        config: expect.objectContaining({
          interaction: expect.objectContaining({
            custom_sprite_path: 'C:\\Users\\pplmx\\Sprites',
          }),
        }),
      }),
    );
  });

  it('extracts parent directory when a file is dropped', async () => {
    let dragDropCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'tauri://drag-drop') {
        dragDropCallback = callback;
      }
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('tauri://drag-drop', expect.any(Function));
    });

    await act(async () => {
      if (dragDropCallback) {
        dragDropCallback({ payload: ['C:\\Users\\pplmx\\Sprites\\idle-1.svg'] });
      }
    });

    expect(invoke).toHaveBeenCalledWith(
      'update_config',
      expect.objectContaining({
        config: expect.objectContaining({
          interaction: expect.objectContaining({
            custom_sprite_path: 'C:\\Users\\pplmx\\Sprites',
          }),
        }),
      }),
    );
  });
});
