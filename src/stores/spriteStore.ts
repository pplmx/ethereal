import { convertFileSrc, isTauri } from '@tauri-apps/api/core';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type SpriteState =
  | 'idle'
  | 'working'
  | 'gaming'
  | 'browsing'
  | 'overheating'
  | 'high_load'
  | 'thinking'
  | 'sleeping';

export interface HardwareData {
  temperature: number;
  utilization: number;
  memory_used: number;
  memory_total: number;
  network_rx: number;
  network_tx: number;
  disk_read: number;
  disk_write: number;
  battery_level: number;
  battery_state: string;
  active_window: string;
  state: string;
  mood: string;
}

export type MoodState =
  | 'happy'
  | 'excited'
  | 'tired'
  | 'bored'
  | 'angry'
  | 'sad'
  | 'curious'
  | 'sleeping';

interface SpriteConfig {
  [key: string]: {
    frameCount: number;
    fps: number;
    loop: boolean;
  };
}

const DEFAULT_SPRITE_CONFIG: SpriteConfig = {
  idle: { frameCount: 4, fps: 8, loop: true },
  working: { frameCount: 4, fps: 12, loop: true },
  gaming: { frameCount: 4, fps: 12, loop: true },
  browsing: { frameCount: 4, fps: 8, loop: true },
  overheating: { frameCount: 4, fps: 24, loop: true },
  high_load: { frameCount: 4, fps: 16, loop: true },
  thinking: { frameCount: 4, fps: 12, loop: true },
  sleeping: { frameCount: 4, fps: 4, loop: true },
};

interface SpriteStore {
  state: SpriteState;
  mood: MoodState;
  isClickThrough: boolean;
  hardware: HardwareData | null;
  aiMessage: string | null;
  spriteConfig: SpriteConfig;
  customSpritePath: string | null;

  setState: (state: SpriteState) => void;
  setMood: (mood: MoodState) => void;
  setCustomSpritePath: (path: string | null) => void;
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
    case 'Sleeping':
      return 'sleeping';
    default:
      return 'idle';
  }
};

const mapBackendMoodToFrontend = (backendMood: string): MoodState => {
  switch (backendMood) {
    case 'Excited':
      return 'excited';
    case 'Tired':
      return 'tired';
    case 'Bored':
      return 'bored';
    case 'Angry':
      return 'angry';
    case 'Sad':
      return 'sad';
    case 'Curious':
      return 'curious';
    case 'Sleeping':
      return 'sleeping';
    default:
      return 'happy';
  }
};

export const useSpriteStore = create<SpriteStore>()(
  devtools(
    persist(
      (set, get) => ({
        state: 'idle',
        mood: 'happy',
        isClickThrough: false,
        hardware: null,
        aiMessage: null,
        spriteConfig: DEFAULT_SPRITE_CONFIG,
        customSpritePath: null,

        setState: (state) => set({ state }),
        setMood: (mood) => set({ mood }),
        setCustomSpritePath: (customSpritePath) => set({ customSpritePath }),

        toggleClickThrough: () => set((state) => ({ isClickThrough: !state.isClickThrough })),

        updateHardware: (hardware) => {
          const currentState = get().state;
          if (currentState === 'thinking') {
            set({ hardware });
            return;
          }

          const newState = mapBackendStateToFrontend(hardware.state);
          const newMood = mapBackendMoodToFrontend(hardware.mood);
          set({ hardware, state: newState, mood: newMood });
        },

        setAiMessage: (aiMessage) => {
          set({ aiMessage });
          if (aiMessage) {
            set({ state: 'thinking' });
          }
        },

        getAnimationFrames: () => {
          const { state, spriteConfig, customSpritePath } = get();
          const config = spriteConfig[state] ?? spriteConfig.idle;
          if (!config) return [];

          const prefix = state;

          if (customSpritePath) {
            const separator = customSpritePath.includes('\\') ? '\\' : '/';
            return Array.from({ length: config.frameCount }, (_, i) => {
              const path = `${customSpritePath}${separator}${prefix}-${i + 1}.svg`;
              return isTauri() ? convertFileSrc(path) : path;
            });
          }

          // Try PNG first (new high-quality sprites), fallback to SVG
          return Array.from(
            { length: config.frameCount },
            (_, i) => `/sprites/${prefix}-${i + 1}.svg`,
          );
        },

        getCurrentFps: () => {
          const { state, mood, spriteConfig } = get();
          const baseFps = spriteConfig[state]?.fps ?? 8;

          switch (mood) {
            case 'excited':
              return baseFps * 1.5;
            case 'tired':
              return baseFps * 0.7;
            case 'bored':
              return baseFps * 0.5;
            case 'angry':
              return baseFps * 2.0;
            case 'sad':
              return baseFps * 0.6;
            case 'curious':
              return baseFps * 1.2;
            case 'sleeping':
              return baseFps * 0.4;
            default:
              return baseFps;
          }
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
