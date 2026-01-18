import { listen } from '@tauri-apps/api/event';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useSpriteStore } from '../../stores/spriteStore';

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

describe('Hardware Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpriteStore.setState({
      state: 'idle',
      hardware: null,
    });
    (vi.stubEnv as any)('DEV', 'true');
    (global.performance as any).memory = { usedJSHeapSize: 100 * 1024 * 1024 };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('displays real-time hardware and network data in DevTools', async () => {
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

    await act(async () => {
      if (hardwareCallback) {
        await hardwareCallback({
          payload: {
            temperature: 55,
            utilization: 42.5,
            memory_used: 4000,
            memory_total: 8000,
            network_rx: 123,
            network_tx: 45,
            disk_read: 10,
            disk_write: 5,
            battery_level: 80,
            battery_state: 'Discharging',
            state: 'Working',
            mood: 'Happy',
          },
        });
      }
    });

    expect(screen.getByText(/CPU: 42.5%/)).toBeInTheDocument();
    expect(screen.getByText(/Net ↓: 123 KB\/s/)).toBeInTheDocument();
    expect(screen.getByText(/Net ↑: 45 KB\/s/)).toBeInTheDocument();
    expect(screen.getByText(/Disk R: 10 KB\/s/)).toBeInTheDocument();
    expect(screen.getByText(/Bat: 80%/)).toBeInTheDocument();
    expect(screen.getByText(/State: Working/)).toBeInTheDocument();
  });
});
