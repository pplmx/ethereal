import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 精灵状态类型
export type SpriteState = 'idle' | 'working' | 'gaming' | 'overheating' | 'thinking';

// 硬件监控数据
export interface HardwareData {
  temperature: number;
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  monitorType: 'nvidia' | 'amd' | 'cpu' | 'mock';
}

// Store 接口定义
interface SpriteStore {
  // 状态
  state: SpriteState;
  position: { x: number; y: number };
  isClickThrough: boolean;
  hardware: HardwareData | null;
  aiMessage: string | null;

  // Actions
  setState: (state: SpriteState) => void;
  setPosition: (x: number, y: number) => void;
  toggleClickThrough: () => void;
  updateHardware: (data: HardwareData) => void;
  setAiMessage: (message: string | null) => void;

  // 计算属性
  isOverheating: () => boolean;
  getAnimationFrames: () => string[];
}

export const useSpriteStore = create<SpriteStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        state: 'idle',
        position: { x: 100, y: 100 },
        isClickThrough: false,
        hardware: null,
        aiMessage: null,

        // Actions 实现
        setState: (state) => set({ state }),

        setPosition: (x, y) => set({ position: { x, y } }),

        toggleClickThrough: () =>
          set((state) => ({ isClickThrough: !state.isClickThrough })),

        updateHardware: (hardware) => {
          set({ hardware });

          // 根据硬件数据自动切换状态
          const threshold = hardware.monitorType === 'cpu' ? 85 : 80;
          if (hardware.temperature > threshold) {
            set({ state: 'overheating' });
          }
        },

        setAiMessage: (aiMessage) => set({ aiMessage }),

        // 计算方法
        isOverheating: () => {
          const { hardware } = get();
          if (!hardware) return false;
          const threshold = hardware.monitorType === 'cpu' ? 85 : 80;
          return hardware.temperature > threshold;
        },

        getAnimationFrames: () => {
          const { state } = get();
          // 根据状态返回对应的精灵图路径
          const baseUrl = '/sprites';
          const frameCount = 8; // 假设每个状态有 8 帧

          return Array.from(
            { length: frameCount },
            (_, i) => `${baseUrl}/${state}/frame_${i + 1}.png`
          );
        },
      }),
      {
        name: 'ethereal-storage', // LocalStorage key
        partialize: (state) => ({
          // 只持久化部分状态
          position: state.position,
          isClickThrough: state.isClickThrough,
        }),
      }
    ),
    { name: 'SpriteStore' } // DevTools 名称
  )
);
