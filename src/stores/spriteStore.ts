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
  state: string;
}

interface SpriteStore {
  state: SpriteState;
  isClickThrough: boolean;
  hardware: HardwareData | null;
  aiMessage: string | null;

  setState: (state: SpriteState) => void;
  toggleClickThrough: () => void;
  updateHardware: (data: HardwareData) => void;
  setAiMessage: (message: string | null) => void;

  getAnimationFrames: () => string[];
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

export const useSpriteStore = create<SpriteStore>()(
  devtools(
    persist(
      (set, get) => ({
        state: 'idle',
        isClickThrough: false,
        hardware: null,
        aiMessage: null,

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
          const baseUrl = '/sprites';

          const prefix = 'idle';
          const frameCount = 4;

          return Array.from({ length: frameCount }, (_, i) => `${baseUrl}/${prefix}-${i + 1}.png`);
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
