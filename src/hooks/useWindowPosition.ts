import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect, useRef } from 'react';
import { logger } from '../lib/logger';

export const useWindowPosition = () => {
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const appWindow = getCurrentWindow();

        unlisten = await appWindow.onMoved(async ({ payload: position }) => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          saveTimeoutRef.current = window.setTimeout(async () => {
            try {
              const x = Math.round(position.x);
              const y = Math.round(position.y);

              await invoke('save_window_position', { x, y });
              logger.debug('Window position saved:', { x, y });
            } catch (error) {
              logger.error('Failed to save window position:', error);
            }
          }, 500);
        });
      } catch (error) {
        logger.error('Failed to setup window listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
};
