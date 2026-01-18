import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResourceStore } from '../../stores/resourceStore';

describe('ResourceStore', () => {
  beforeEach(() => {
    useResourceStore.setState({
      loadedSprites: new Set(),
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  it('initially has no loaded sprites', () => {
    expect(useResourceStore.getState().loadedSprites.size).toBe(0);
  });

  it('preloads images and updates state', async () => {
    const originalImage = window.Image;
    window.Image = class {
      onload: any;
      set src(_: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    const urls = ['/test1.svg', '/test2.svg'];
    await act(async () => {
      await useResourceStore.getState().preloadImages(urls);
    });

    expect(useResourceStore.getState().loadedSprites.has('/test1.svg')).toBe(true);
    expect(useResourceStore.getState().loadedSprites.has('/test2.svg')).toBe(true);
    expect(useResourceStore.getState().isLoading).toBe(false);

    window.Image = originalImage;
  });

  it('checks if image is loaded', () => {
    useResourceStore.setState({
      loadedSprites: new Set(['/preloaded.svg']),
    });
    expect(useResourceStore.getState().isImageLoaded('/preloaded.svg')).toBe(true);
    expect(useResourceStore.getState().isImageLoaded('/not-loaded.svg')).toBe(false);
  });
});
