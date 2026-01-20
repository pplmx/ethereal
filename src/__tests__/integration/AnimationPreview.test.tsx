import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimationPreview } from '../../components/AnimationPreview';

// Mock child component
vi.mock('../../components/SpriteAnimator', () => ({
  SpriteAnimator: () => <div data-testid="sprite-animator" />,
}));

describe('AnimationPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<AnimationPreview />);
    expect(screen.getByTestId('sprite-animator')).toBeInTheDocument();
    expect(screen.getByLabelText(/action/i)).toBeInTheDocument();
  });

  it('allows changing preview state', () => {
    render(<AnimationPreview />);
    const select = screen.getByLabelText(/action/i);

    fireEvent.change(select, { target: { value: 'working' } });
    expect(select).toHaveValue('working');
  });

  it('displays config info', () => {
    render(<AnimationPreview />);
    // FPS and Frames should be visible
    expect(screen.getByText('FPS:')).toBeInTheDocument();
    expect(screen.getByText('Frames:')).toBeInTheDocument();
  });
});
