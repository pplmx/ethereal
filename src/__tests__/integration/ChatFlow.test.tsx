import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';
import { useChatStore } from '../../stores/chatStore';

vi.mock('@components/DevTools', () => ({
  DevTools: () => <div data-testid="devtools" />,
}));

vi.mock('@components/SpriteAnimator', () => ({
  SpriteAnimator: () => <div data-testid="sprite-animator" />,
}));

vi.mock('@components/SpeechBubble', () => ({
  SpeechBubble: () => <div data-testid="speech-bubble" />,
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
  beforeEach(() => {
    vi.clearAllMocks();
    const store = useChatStore.getState();
    store.setMessage(null);
    store.setVisible(false);
    store.setThinking(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates chat store when clipboard changes', async () => {
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
        systemContext: expect.any(String),
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
