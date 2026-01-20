import { AnimationPreview } from '@components/AnimationPreview';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock SpriteAnimator to verify props passed to it
vi.mock('@components/SpriteAnimator', () => ({
  SpriteAnimator: vi.fn(({ mood, frames, className: _className }) => (
    <div data-testid="mock-sprite-animator">
      <span data-testid="prop-mood">{mood}</span>
      <span data-testid="prop-frames-count">{frames.length}</span>
    </div>
  )),
}));

// Mock store
vi.mock('@stores/spriteStore', () => ({
  useSpriteStore: () => ({
    spriteConfig: {
      idle: { fps: 12, frameCount: 10, loop: true },
      walking: { fps: 12, frameCount: 8, loop: true },
    },
  }),
}));

describe('AnimationPreview Component', () => {
  it('renders correctly with default state', () => {
    render(<AnimationPreview />);

    // Default mood is "happy"
    expect(screen.getByTestId('prop-mood')).toHaveTextContent('happy');
    // Default state is "idle" (10 frames in mock)
    expect(screen.getByTestId('prop-frames-count')).toHaveTextContent('10');
  });

  it('updates mood when selector changes', () => {
    render(<AnimationPreview />);

    // Find mood selector (second select in the component usually, or by label if possible)
    // We added labels "Action" and "Mood".
    const moodSelect = screen.getByLabelText('Mood');

    fireEvent.change(moodSelect, { target: { value: 'angry' } });

    expect(screen.getByTestId('prop-mood')).toHaveTextContent('angry');
  });

  it('updates action state when selector changes', () => {
    render(<AnimationPreview />);

    const actionSelect = screen.getByLabelText('Action');

    fireEvent.change(actionSelect, { target: { value: 'walking' } });

    // Walking has 8 frames in mock
    expect(screen.getByTestId('prop-frames-count')).toHaveTextContent('8');
  });
});
