import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SpriteAnimator } from '../components/SpriteAnimator';

describe('SpriteAnimator', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders nothing when frames array is empty', () => {
    const { container } = render(<SpriteAnimator frames={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading spinner initially', () => {
    const frames = ['frame1.png', 'frame2.png'];
    render(<SpriteAnimator frames={frames} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders sprite after loading', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    const frames = ['frame1.png', 'frame2.png'];
    render(<SpriteAnimator frames={frames} fps={10} />);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByAltText('Sprite')).toBeInTheDocument();

    window.Image = originalImage;
  });

  it('cycles through frames based on fps', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    const frames = ['frame1.png', 'frame2.png', 'frame3.png'];
    render(<SpriteAnimator frames={frames} fps={10} />);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame1.png');

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame2.png');
    });

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame3.png');
    });

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame1.png');
    });

    window.Image = originalImage;
  });

  it('stops at last frame when loop is false', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    const onAnimationEnd = vi.fn();
    const frames = ['frame1.png', 'frame2.png'];
    render(
      <SpriteAnimator frames={frames} fps={10} loop={false} onAnimationEnd={onAnimationEnd} />,
    );

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame1.png');

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame2.png');
    });

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    expect(onAnimationEnd).toHaveBeenCalled();
    expect(screen.getByAltText('Sprite')).toHaveAttribute('src', 'frame2.png');

    window.Image = originalImage;
  });

  it('has disabled drag and context menu', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    render(<SpriteAnimator frames={['frame1.png']} />);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const img = screen.getByAltText('Sprite');
    expect(img).toHaveAttribute('draggable', 'false');

    const preventDefault = vi.fn();
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'preventDefault', { value: preventDefault });

    act(() => {
      img.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();

    window.Image = originalImage;
  });

  it('applies custom className to the image', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    render(<SpriteAnimator frames={['frame1.png']} className="custom-class" />);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const img = screen.getByAltText('Sprite');
    expect(img).toHaveClass('custom-class');

    window.Image = originalImage;
  });
});
