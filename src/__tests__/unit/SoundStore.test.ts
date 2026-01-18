import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundStore } from '../../stores/soundStore';

describe('SoundStore', () => {
  beforeEach(() => {
    useSoundStore.setState({
      enabled: true,
      volume: 0.5,
    });
    vi.clearAllMocks();
  });

  it('toggles sound enabled state', () => {
    act(() => {
      useSoundStore.getState().toggleSound();
    });
    expect(useSoundStore.getState().enabled).toBe(false);

    act(() => {
      useSoundStore.getState().toggleSound();
    });
    expect(useSoundStore.getState().enabled).toBe(true);
  });

  it('sets volume correctly', () => {
    act(() => {
      useSoundStore.getState().setVolume(0.8);
    });
    expect(useSoundStore.getState().volume).toBe(0.8);
  });

  it('syncs with config correctly', () => {
    act(() => {
      useSoundStore.getState().syncWithConfig({ enabled: false, volume: 0.2 });
    });
    expect(useSoundStore.getState().enabled).toBe(false);
    expect(useSoundStore.getState().volume).toBe(0.2);
  });

  it('does not play sound when disabled', async () => {
    const playMock = vi.fn();
    window.Audio = vi.fn().mockImplementation(() => ({
      play: playMock,
      volume: 1,
      currentTime: 0,
    })) as any;

    act(() => {
      useSoundStore.getState().toggleSound();
    });

    await useSoundStore.getState().playSound('/test.mp3');
    expect(playMock).not.toHaveBeenCalled();
  });
});
