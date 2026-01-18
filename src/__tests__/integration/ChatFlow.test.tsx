import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useChatStore } from '../../stores/chatStore';
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

describe('Chat Flow Integration', () => {
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
    useSettingsStore.setState({ config: mockConfig as any });

    (invoke as Mock).mockImplementation(async (cmd) => {
      if (cmd === 'get_config') return mockConfig;
      if (cmd === 'chat_with_ethereal') return 'Hello from AI!';
      return null;
    });

    const store = useChatStore.getState();
    store.setMessage(null);
    store.setVisible(false);
    store.setThinking(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates chat store when clipboard changes and includes system context', async () => {
    let clipboardCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'clipboard-changed') {
        clipboardCallback = callback;
        return () => {};
      }
      return () => {};
    });

    (invoke as Mock).mockResolvedValue('Hello from AI!');

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('clipboard-changed', expect.any(Function));
    });

    expect(clipboardCallback).toBeDefined();

    await act(async () => {
      if (clipboardCallback) {
        await clipboardCallback({ payload: 'User copied text' });
      }
    });

    expect(invoke).toHaveBeenCalledWith(
      'chat_with_ethereal',
      expect.objectContaining({
        message: 'User copied text',
        systemContext: expect.stringContaining('Mood:'),
        mood: expect.any(String),
      }),
    );

    await waitFor(() => {
      const state = useChatStore.getState();
      expect(state.message).toBe('Hello from AI!');
      expect(state.isVisible).toBe(true);
      expect(state.isThinking).toBe(false);
    });
  });

  it('handles errors gracefully', async () => {
    let clipboardCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'clipboard-changed') {
        clipboardCallback = callback;
        return () => {};
      }
      return () => {};
    });

    (invoke as Mock).mockRejectedValue(new Error('Backend error'));

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('clipboard-changed', expect.any(Function));
    });

    await act(async () => {
      if (clipboardCallback) {
        await clipboardCallback({ payload: 'User copied text' });
      }
    });

    expect(invoke).toHaveBeenCalledWith(
      'chat_with_ethereal',
      expect.objectContaining({
        message: 'User copied text',
        systemContext: expect.any(String),
      }),
    );

    await waitFor(() => {
      const state = useChatStore.getState();
      expect(state.message).toBe("I'm having trouble connecting to my brain...");
      expect(state.isVisible).toBe(true);
      expect(state.isThinking).toBe(false);
    });
  });
});
