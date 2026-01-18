import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useChatStore } from '../../stores/chatStore';
import { useSoundStore } from '../../stores/soundStore';
import { useSpriteStore } from '../../stores/spriteStore';

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock audio
const playMock = vi.fn().mockResolvedValue(undefined);

// Create a spy that works as a constructor
const AudioMock = vi.fn(function (this: any, url: string) {
  this.src = url;
  this.play = playMock;
  this.volume = 1;
  this.currentTime = 0;
});

describe('useSoundEffects Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Explicitly set window.Audio for JSDOM
    window.Audio = AudioMock as any;

    useSoundStore.setState({ enabled: true, volume: 0.5 });
    useSpriteStore.setState({ state: 'idle' });
    useChatStore.setState({ isThinking: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const TestComponent = () => {
    useSoundEffects();
    return null;
  };

  it('Audio mock works directly', async () => {
    await useSoundStore.getState().playSound('/test.mp3');
    expect(playMock).toHaveBeenCalled();
    expect(AudioMock).toHaveBeenCalledWith('/test.mp3');
  });

  it('plays sound on state transition to overheating', async () => {
    render(<TestComponent />);

    await act(async () => {
      useSpriteStore.setState({ state: 'overheating' });
    });

    expect(playMock).toHaveBeenCalled();
    expect(AudioMock).toHaveBeenCalledWith('/sounds/alert.mp3');
  });

  it('plays sound on state transition to gaming', async () => {
    render(<TestComponent />);

    await act(async () => {
      useSpriteStore.setState({ state: 'gaming' });
    });

    expect(playMock).toHaveBeenCalled();
    expect(AudioMock).toHaveBeenCalledWith('/sounds/active.mp3');
  });

  it('plays sound when thinking starts', async () => {
    render(<TestComponent />);

    await act(async () => {
      useChatStore.setState({ isThinking: true });
    });

    expect(playMock).toHaveBeenCalled();
    expect(AudioMock).toHaveBeenCalledWith('/sounds/thinking.mp3');
  });

  it('plays sound when thinking ends', async () => {
    render(<TestComponent />);

    await act(async () => {
      useChatStore.setState({ isThinking: true });
    });
    // Clear previous calls
    playMock.mockClear();
    AudioMock.mockClear();

    await act(async () => {
      useChatStore.setState({ isThinking: false });
    });

    expect(playMock).toHaveBeenCalled();
    expect(AudioMock).toHaveBeenCalledWith('/sounds/notification.mp3');
  });

  it('does not play sound if disabled', async () => {
    act(() => {
      useSoundStore.setState({ enabled: false });
    });
    render(<TestComponent />);

    await act(async () => {
      useSpriteStore.setState({ state: 'overheating' });
    });

    expect(playMock).not.toHaveBeenCalled();
  });
});
