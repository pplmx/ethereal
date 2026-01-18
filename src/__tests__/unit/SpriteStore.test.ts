import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpriteStore } from '../../stores/spriteStore';

describe('Sprite Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpriteStore.setState({
      state: 'idle',
      hardware: null,
      aiMessage: null,
      isClickThrough: false,
    });
  });

  it('initializes with idle state', () => {
    const { state } = useSpriteStore.getState();
    expect(state).toBe('idle');
  });

  it('updates state based on hardware data', () => {
    const { updateHardware } = useSpriteStore.getState();

    act(() => {
      updateHardware({
        state: 'Gaming',
        temperature: 60,
        utilization: 50,
        memory_used: 100,
        memory_total: 1000,
      });
    });

    expect(useSpriteStore.getState().state).toBe('gaming');
  });

  it('prioritizes thinking state over hardware updates', () => {
    const { setAiMessage, updateHardware } = useSpriteStore.getState();

    act(() => {
      setAiMessage('Hello');
    });

    expect(useSpriteStore.getState().state).toBe('thinking');

    act(() => {
      updateHardware({
        state: 'Overheating',
        temperature: 90,
        utilization: 100,
        memory_used: 100,
        memory_total: 1000,
      });
    });

    expect(useSpriteStore.getState().state).toBe('thinking');
    expect(useSpriteStore.getState().hardware?.temperature).toBe(90);
  });

  it('returns correct frame count for state', () => {
    const { getAnimationFrames } = useSpriteStore.getState();

    expect(getAnimationFrames()).toHaveLength(4);
    expect(getAnimationFrames()[0]).toContain('/sprites/idle-1.svg');
  });

  it('returns correct FPS for state', () => {
    const { getCurrentFps, setState } = useSpriteStore.getState();

    act(() => setState('overheating'));
    expect(getCurrentFps()).toBe(24);
  });
});
