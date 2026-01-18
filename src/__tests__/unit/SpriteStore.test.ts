import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpriteStore } from '../../stores/spriteStore';

describe('Sprite Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpriteStore.setState({
      state: 'idle',
      mood: 'happy',
      hardware: null,
      aiMessage: null,
      isClickThrough: false,
    });
  });

  it('initializes with idle state', () => {
    const { state } = useSpriteStore.getState();
    expect(state).toBe('idle');
  });

  it('updates state and mood based on hardware data', () => {
    const { updateHardware } = useSpriteStore.getState();

    act(() => {
      updateHardware({
        state: 'Gaming',
        mood: 'Excited',
        temperature: 60,
        utilization: 50,
        memory_used: 100,
        memory_total: 1000,
        network_rx: 0,
        network_tx: 0,
        disk_read: 0,
        disk_write: 0,
        battery_level: 100,
        battery_state: 'Full',
      });
    });

    expect(useSpriteStore.getState().state).toBe('gaming');
    expect(useSpriteStore.getState().mood).toBe('excited');
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
        mood: 'Angry',
        temperature: 90,
        utilization: 100,
        memory_used: 100,
        memory_total: 1000,
        network_rx: 0,
        network_tx: 0,
        disk_read: 0,
        disk_write: 0,
        battery_level: 50,
        battery_state: 'Discharging',
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
