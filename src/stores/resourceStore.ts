import { create } from 'zustand';
import { logger } from '../lib/logger';

interface ResourceState {
  loadedSprites: Set<string>;
  isLoading: boolean;

  preloadImages: (urls: string[]) => Promise<void>;
  isImageLoaded: (url: string) => boolean;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  loadedSprites: new Set(),
  isLoading: false,

  preloadImages: async (urls) => {
    set({ isLoading: true });

    const promises = urls.map((url) => {
      if (get().loadedSprites.has(url)) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          set((state) => {
            const newSet = new Set(state.loadedSprites);
            newSet.add(url);
            return { loadedSprites: newSet };
          });
          resolve();
        };
        img.onerror = (e) => {
          logger.warn(`Failed to preload image: ${url}`, e);
          // Resolve anyway to prevent blocking
          resolve();
        };
      });
    });

    await Promise.all(promises);
    set({ isLoading: false });
  },

  isImageLoaded: (url) => get().loadedSprites.has(url),
}));
