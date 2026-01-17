import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { create } from 'zustand';
import { logger } from '../lib/logger';
import type { AppConfig } from '../types/config';

interface SettingsState {
  config: AppConfig | null;
  isOpen: boolean;
  isLoading: boolean;

  loadConfig: () => Promise<void>;
  updateConfig: (newConfig: AppConfig) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  initialize: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  config: null,
  isOpen: false,
  isLoading: false,

  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const config = await invoke<AppConfig>('get_config');
      set({ config, isLoading: false });
    } catch (e) {
      logger.error('Failed to load config', e);
      set({ isLoading: false });
    }
  },

  updateConfig: async (newConfig) => {
    set({ isLoading: true });
    try {
      await invoke('update_config', { config: newConfig });
      set({ config: newConfig, isLoading: false });
      logger.info('Config updated');
    } catch (e) {
      logger.error('Failed to update config', e);
      set({ isLoading: false });
    }
  },

  setIsOpen: (isOpen) => set({ isOpen }),

  initialize: () => {
    get().loadConfig();

    listen<AppConfig>('config-updated', (event) => {
      set({ config: event.payload });
      logger.debug('Config synced from backend');
    });
  },
}));
