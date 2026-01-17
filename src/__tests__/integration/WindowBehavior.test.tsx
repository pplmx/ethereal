import { useDraggable } from '@hooks/useDraggable';
import { useWindowPosition } from '@hooks/useWindowPosition';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import App from '../../App';

// Mock dependencies
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
  useDraggable: vi.fn(),
}));

vi.mock('@hooks/useWindowPosition', () => ({
  useWindowPosition: vi.fn(),
}));

// Mock Tauri APIs
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
  },
}));

describe('Window Behavior Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useDraggable as Mock).mockReturnValue({
      startDragging: vi.fn(),
    });
    (useWindowPosition as Mock).mockReturnValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes window position hook', () => {
    render(<App />);
    expect(useWindowPosition).toHaveBeenCalled();
  });

  it('starts dragging when main area is clicked', () => {
    const startDraggingMock = vi.fn();
    (useDraggable as Mock).mockReturnValue({
      startDragging: startDraggingMock,
    });

    render(<App />);

    const main = screen.getByRole('main');
    fireEvent.mouseDown(main);

    expect(startDraggingMock).toHaveBeenCalled();
  });

  it('renders all core components', () => {
    render(<App />);

    expect(screen.getByTestId('devtools')).toBeInTheDocument();
    expect(screen.getByTestId('sprite-animator')).toBeInTheDocument();
    expect(screen.getByTestId('speech-bubble')).toBeInTheDocument();
  });
});
