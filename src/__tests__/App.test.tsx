import { useDraggable } from '@hooks/useDraggable';
import { useSettingsStore } from '@stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../App';

vi.mock('@hooks/useDraggable', () => ({
  useDraggable: vi.fn(),
}));

vi.mock('@hooks/useWindowPosition', () => ({
  useWindowPosition: vi.fn(),
}));

vi.mock('@components/DevTools', () => ({
  DevTools: () => <div data-testid="devtools" />,
}));

vi.mock('@components/SpriteAnimator', () => ({
  SpriteAnimator: ({ frames }: { frames: string[] }) => (
    <img src={frames[0]} alt="sprite" data-testid="sprite-animator" />
  ),
}));

vi.mock('@components/SpeechBubble', () => ({
  SpeechBubble: () => <div data-testid="speech-bubble" />,
}));

vi.mock('@components/SettingsModal', () => ({
  SettingsModal: () => <div data-testid="settings-modal" />,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('App', () => {
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

    (invoke as Mock).mockImplementation(async (cmd: string) => {
      if (cmd === 'get_config') return mockConfig;
      return null;
    });

    (useDraggable as Mock).mockReturnValue({
      startDragging: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with components', () => {
    render(<App />);
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('sprite-animator')).toBeInTheDocument();
    expect(screen.getByTestId('speech-bubble')).toBeInTheDocument();
  });

  it('initiates drag on mouse down', () => {
    const startDraggingMock = vi.fn();
    (useDraggable as Mock).mockReturnValue({
      startDragging: startDraggingMock,
    });

    render(<App />);
    const mainElement = screen.getByRole('main');
    fireEvent.mouseDown(mainElement);

    expect(startDraggingMock).toHaveBeenCalled();
  });
});
