import { invoke } from '@tauri-apps/api/core';
import { create } from 'zustand';
import { logger } from '../lib/logger';

export interface MonitorInfo {
  name: string | null;
  position: [number, number];
  size: [number, number];
  scale_factor: number;
  is_primary: boolean;
}

interface MonitorState {
  monitors: MonitorInfo[];
  isLoading: boolean;

  fetchMonitors: () => Promise<void>;
  moveToMonitor: (index: number) => Promise<void>;
}

export const useMonitorStore = create<MonitorState>((set) => ({
  monitors: [],
  isLoading: false,

  fetchMonitors: async () => {
    set({ isLoading: true });
    try {
      const monitors = await invoke<MonitorInfo[]>('get_monitors');
      set({ monitors, isLoading: false });
    } catch (e) {
      logger.error('Failed to fetch monitors', e);
      set({ isLoading: false });
    }
  },

  moveToMonitor: async (index) => {
    try {
      await invoke('move_to_monitor', { monitorIndex: index });
      logger.info(`Moved to monitor ${index}`);
    } catch (e) {
      logger.error(`Failed to move to monitor ${index}`, e);
    }
  },
}));
