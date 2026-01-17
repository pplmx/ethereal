import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useWindowPosition } from '../hooks/useWindowPosition';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: vi.fn(),
}));

vi.mock('../lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useWindowPosition', () => {
  const onMovedMock = vi.fn();
  const unlistenMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    (getCurrentWindow as Mock).mockReturnValue({
      onMoved: onMovedMock.mockResolvedValue(unlistenMock),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Since it's a hook, we need a component to run it
  const TestComponent = () => {
    useWindowPosition();
    return null;
  };

  it('sets up listener on mount', async () => {
    render(<TestComponent />);

    // allow async effect to run
    await vi.waitFor(() => {
      expect(onMovedMock).toHaveBeenCalled();
    });
  });

  it('debounces save calls', async () => {
    render(<TestComponent />);

    await vi.waitFor(() => {
      expect(onMovedMock).toHaveBeenCalled();
    });

    if (onMovedMock.mock.calls[0] && onMovedMock.mock.calls[0][0]) {
      const callback = onMovedMock.mock.calls[0][0];

      callback({ payload: { x: 100, y: 100 } });
      callback({ payload: { x: 200, y: 200 } });

      expect(invoke).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);

      expect(invoke).toHaveBeenCalledTimes(1);
      expect(invoke).toHaveBeenCalledWith('save_window_position', { x: 200, y: 200 });
    }
  });

  it('cleans up listener on unmount', async () => {
    const { unmount } = render(<TestComponent />);

    await vi.waitFor(() => {
      expect(onMovedMock).toHaveBeenCalled();
    });

    unmount();
    expect(unlistenMock).toHaveBeenCalled();
  });
});
