import { invoke } from '@tauri-apps/api/core';
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

describe('Click-through Shortcut Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
