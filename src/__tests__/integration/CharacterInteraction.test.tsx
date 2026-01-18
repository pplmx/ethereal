import { invoke } from '@tauri-apps/api/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  listen: vi.fn().mockResolvedValue(() => {}),
}));

describe('Character Interaction Integration', () => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({ config: mockConfig as any });

    (invoke as Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'get_config') return mockConfig;
      if (cmd === 'chat_with_ethereal') return 'Ouch! Stop double clicking me!';
      return null;
    });

    useChatStore.setState({ message: null, isVisible: false, isThinking: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers AI chat on double click when configured', async () => {
    render(<App />);

    const main = screen.getByRole('main');
    fireEvent.doubleClick(main);

    await waitFor(
      () => {
        expect(useChatStore.getState().isThinking).toBe(true);
      },
      { timeout: 2000 },
    );

    await waitFor(
      () => {
        expect(useChatStore.getState().message).toBe('Ouch! Stop double clicking me!');
        expect(useChatStore.getState().isVisible).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it('shows native context menu on right click', async () => {
    render(<App />);

    const main = screen.getByRole('main');
    fireEvent.contextMenu(main);

    expect(invoke).toHaveBeenCalledWith('show_context_menu');
  });
});
