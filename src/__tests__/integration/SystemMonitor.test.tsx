import { listen } from '@tauri-apps/api/event';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
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

describe('System Monitoring Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpriteStore.setState({
      state: 'idle',
      hardware: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates sprite state on gpu-update event', async () => {
    let hardwareCallback: ((event: any) => void) | undefined;

    (listen as Mock).mockImplementation(async (event, callback) => {
      if (event === 'gpu-update') {
        hardwareCallback = callback;
        return () => {};
      }
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(listen).toHaveBeenCalledWith('gpu-update', expect.any(Function));
    });

    expect(hardwareCallback).toBeDefined();

    // Simulate High Load
    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 60,
            utilization: 90,
            memory_used: 4000,
            memory_total: 8000,
            state: 'HighLoad', // Backend string
          },
        });
      }
    });

    await waitFor(() => {
      const state = useSpriteStore.getState();
      expect(state.state).toBe('high_load');
      expect(state.hardware?.utilization).toBe(90);
    });

    // Simulate Gaming
    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 70,
            utilization: 50,
            memory_used: 4000,
            memory_total: 8000,
            state: 'Gaming',
          },
        });
      }
    });

    await waitFor(() => {
      const state = useSpriteStore.getState();
      expect(state.state).toBe('gaming');
    });
  });
});
