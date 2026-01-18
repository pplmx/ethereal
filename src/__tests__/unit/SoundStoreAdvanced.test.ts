import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundStore } from '../../stores/soundStore';

describe('SoundStore Advanced', () => {
  beforeEach(() => {
    useSoundStore.setState({
      enabled: true,
      volume: 0.5,
    });
    vi.clearAllMocks();
  });

  it('sets volume values correctly', () => {
    act(() => {
      useSoundStore.getState().setVolume(1.0);
    });
    expect(useSoundStore.getState().volume).toBe(1.0);

    act(() => {
      useSoundStore.getState().setVolume(0.0);
    });
    expect(useSoundStore.getState().volume).toBe(0.0);
  });

  it('maintains audio cache for performance', async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);

    const AudioMock = vi.fn().mockImplementation(function (this: any) {
      this.play = playMock;
      this.volume = 1;
      this.currentTime = 0;
      return this;
    });

    window.Audio = AudioMock as any;

    const uniqueUrl = `/sounds/unique-test-${Math.random()}.mp3`;

    await useSoundStore.getState().playSound(uniqueUrl);
    expect(AudioMock).toHaveBeenCalledTimes(1);

    await useSoundStore.getState().playSound(uniqueUrl);
    expect(AudioMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(2);
  });
});
