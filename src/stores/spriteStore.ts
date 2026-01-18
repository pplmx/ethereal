import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type SpriteState =
  | 'idle'
  | 'working'
  | 'gaming'
  | 'browsing'
  | 'overheating'
  | 'high_load'
  | 'thinking';

export interface HardwareData {
  temperature: number;
  utilization: number;
  memory_used: number;
  memory_total: number;
  network_rx: number;
  network_tx: number;
  disk_read: number;
  disk_write: number;
  state: string;
}

interface SpriteConfig {
  [key: string]: {
    frameCount: number;
    fps: number;
    loop: boolean;
  };
}

interface SpriteStore {
  state: SpriteState;
  isClickThrough: boolean;
  hardware: HardwareData | null;
  aiMessage: string | null;
  spriteConfig: SpriteConfig;

  setState: (state: SpriteState) => void;
  toggleClickThrough: () => void;
  updateHardware: (data: HardwareData) => void;
  setAiMessage: (message: string | null) => void;

  getAnimationFrames: () => string[];
  getCurrentFps: () => number;
  shouldLoop: () => boolean;
}

const mapBackendStateToFrontend = (backendState: string): SpriteState => {
  switch (backendState) {
    case 'Overheating':
      return 'overheating';
    case 'HighLoad':
      return 'high_load';
    case 'Working':
      return 'working';
    case 'Gaming':
      return 'gaming';
    case 'Browsing':
      return 'browsing';
    default:
      return 'idle';
  }
};

const DEFAULT_SPRITE_CONFIG: SpriteConfig = {
  idle: { frameCount: 4, fps: 8, loop: true },
  working: { frameCount: 4, fps: 12, loop: true },
  gaming: { frameCount: 4, fps: 12, loop: true },
  browsing: { frameCount: 4, fps: 8, loop: true },
  overheating: { frameCount: 4, fps: 24, loop: true },
  high_load: { frameCount: 4, fps: 16, loop: true },
  thinking: { frameCount: 4, fps: 12, loop: true },
};

export const useSpriteStore = create<SpriteStore>()(
  devtools(
    persist(
      (set, get) => ({
        state: 'idle',
        isClickThrough: false,
        hardware: null,
        aiMessage: null,
        spriteConfig: DEFAULT_SPRITE_CONFIG,

        setState: (state) => set({ state }),

        toggleClickThrough: () => set((state) => ({ isClickThrough: !state.isClickThrough })),

        updateHardware: (hardware) => {
          const currentState = get().state;
          if (currentState === 'thinking') {
            set({ hardware });
            return;
          }

          const newState = mapBackendStateToFrontend(hardware.state);
          set({ hardware, state: newState });
        },

        setAiMessage: (aiMessage) => {
          set({ aiMessage });
          if (aiMessage) {
            set({ state: 'thinking' });
          }
        },

        getAnimationFrames: () => {
          const { state, spriteConfig } = get();
          // Safe fallback to idle if config missing
          const config = spriteConfig[state] ?? spriteConfig.idle;

          // Ensure config is not undefined (TS check)
          if (!config) return [];

          const baseUrl = '/sprites';

          const prefix = state;

          return Array.from(
            { length: config.frameCount },
            (_, i) => `${baseUrl}/${prefix}-${i + 1}.svg`,
          );
        },

        getCurrentFps: () => {
          const { state, spriteConfig } = get();
          return spriteConfig[state]?.fps ?? 8;
        },

        shouldLoop: () => {
          const { state, spriteConfig } = get();
          return spriteConfig[state]?.loop ?? true;
        },
      }),
      {
        name: 'ethereal-storage',
        partialize: (state) => ({
          isClickThrough: state.isClickThrough,
        }),
      },
    ),
    { name: 'SpriteStore' },
  ),
);
