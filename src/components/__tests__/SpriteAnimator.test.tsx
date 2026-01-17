import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SpriteAnimator } from '../SpriteAnimator';

describe('SpriteAnimator', () => {
  const mockFrames = ['/sprite1.png', '/sprite2.png', '/sprite3.png'];

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock Image 加载
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          this.onload?.();
        }, 0);
      }
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该渲染加载状态', () => {
    render(<SpriteAnimator frames={mockFrames} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('应该渲染第一帧', async () => {
    render(<SpriteAnimator frames={mockFrames} fps={12} />);

    // 等待图片加载
    await vi.runAllTimersAsync();

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockFrames[0]);
    });
  });

  it('应该以指定 FPS 循环播放', async () => {
    const fps = 2; // 2 帧/秒 = 500ms/帧
    render(<SpriteAnimator frames={mockFrames} fps={fps} />);

    await vi.runAllTimersAsync();

    // 初始应该是第一帧
    let img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockFrames[0]);

    // 前进 500ms (一帧时间)
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockFrames[1]);
    });

    // 再前进 500ms
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockFrames[2]);
    });

    // 再前进 500ms,应该循环到第一帧
    vi.advanceTimersByTime(500);
    await waitFor(() => {
      img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockFrames[0]);
    });
  });

  it('非循环模式应该停在最后一帧', async () => {
    const onAnimationEnd = vi.fn();
    render(
      <SpriteAnimator
        frames={mockFrames}
        fps={10}
        loop={false}
        onAnimationEnd={onAnimationEnd}
      />
    );

    await vi.runAllTimersAsync();

    // 快进到最后一帧
    vi.advanceTimersByTime(300); // 3 帧 * 100ms

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', mockFrames[2]);
      expect(onAnimationEnd).toHaveBeenCalledTimes(1);
    });

    // 再等待一段时间,应该仍停在最后一帧
    vi.advanceTimersByTime(200);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockFrames[2]);
  });

  it('应该禁用拖拽和右键菜单', async () => {
    render(<SpriteAnimator frames={mockFrames} />);
    await vi.runAllTimersAsync();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('draggable', 'false');

    // 模拟右键菜单事件
    const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
    const preventDefault = vi.fn();
    Object.defineProperty(contextMenuEvent, 'preventDefault', {
      value: preventDefault,
    });

    img.dispatchEvent(contextMenuEvent);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('应该应用自定义 className', async () => {
    const customClass = 'custom-sprite';
    render(<SpriteAnimator frames={mockFrames} className={customClass} />);
    await vi.runAllTimersAsync();

    const img = screen.getByRole('img');
    expect(img).toHaveClass(customClass);
  });
});
