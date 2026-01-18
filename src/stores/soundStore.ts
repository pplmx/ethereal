import { create } from 'zustand';
import { logger } from '../lib/logger';

interface SoundState {
  enabled: boolean;
  volume: number;

  toggleSound: () => void;
  setVolume: (volume: number) => void;
  syncWithConfig: (config: { enabled: boolean; volume: number }) => void;
  playSound: (sound: string) => Promise<void>;
}

const audioCache: Record<string, HTMLAudioElement> = {};

export const useSoundStore = create<SoundState>((set, get) => ({
  enabled: true,
  volume: 0.5,

  toggleSound: () => set((state) => ({ enabled: !state.enabled })),
  setVolume: (volume) => set({ volume }),

  // Sync with backend config
  syncWithConfig: (config) => {
    set({ enabled: config.enabled, volume: config.volume });
  },

  playSound: async (soundUrl) => {
    const { enabled, volume } = get();
    if (!enabled) return;

    try {
      let audio = audioCache[soundUrl];
      if (!audio) {
        audio = new Audio(soundUrl);
        audioCache[soundUrl] = audio;
      }

      audio.currentTime = 0;
      audio.volume = volume;
      await audio.play();
    } catch (e) {
      logger.warn(`Failed to play sound: ${soundUrl}`, e);
    }
  },
}));
