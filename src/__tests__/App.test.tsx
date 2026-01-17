import { useDraggable } from '@hooks/useDraggable';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../App';

vi.mock('@hooks/useDraggable', () => ({
  useDraggable: vi.fn(),
}));

vi.mock('@hooks/useWindowPosition', () => ({
  useWindowPosition: vi.fn(),
}));

vi.mock('@components/DevTools', () => ({
  DevTools: () => <div data-testid="devtools" />,
}));

vi.mock('@components/SpriteAnimator', () => ({
  SpriteAnimator: ({ frames }: { frames: string[] }) => (
    <img src={frames[0]} alt="sprite" data-testid="sprite-animator" />
  ),
}));

vi.mock('@components/SpeechBubble', () => ({
  SpeechBubble: () => <div data-testid="speech-bubble" />,
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(() => {}),
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useDraggable as Mock).mockReturnValue({
      startDragging: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with components', () => {
    render(<App />);
    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('sprite-animator')).toBeInTheDocument();
    expect(screen.getByTestId('speech-bubble')).toBeInTheDocument();
  });

  it('initiates drag on mouse down', () => {
    const startDraggingMock = vi.fn();
    (useDraggable as Mock).mockReturnValue({
      startDragging: startDraggingMock,
    });

    render(<App />);
    const mainElement = screen.getByRole('main');
    fireEvent.mouseDown(mainElement);

    expect(startDraggingMock).toHaveBeenCalled();
  });
});
