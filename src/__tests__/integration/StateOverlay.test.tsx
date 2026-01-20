import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { StateOverlay } from '../../components/StateOverlay';
import { useSpriteStore } from '../../stores/spriteStore';

describe('StateOverlay', () => {
  beforeEach(() => {
    useSpriteStore.setState({
      state: 'idle',
      mood: 'happy',
    });
  });

  it('renders current state and mood emoji', () => {
    render(<StateOverlay />);

    expect(screen.getByText('IDLE')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('updates when store state changes', async () => {
    render(<StateOverlay />);

    await act(async () => {
      useSpriteStore.setState({
        state: 'overheating',
        mood: 'angry',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('OVERHEATING')).toBeInTheDocument();
      expect(screen.getByText('😡')).toBeInTheDocument();
    });
  });

  it('handles snake_case states correctly', async () => {
    await act(async () => {
      useSpriteStore.setState({
        state: 'high_load',
        mood: 'tired',
      });
    });

    render(<StateOverlay />);

    expect(screen.getByText('HIGH LOAD')).toBeInTheDocument();
    expect(screen.getByText('😴')).toBeInTheDocument();
  });
});
