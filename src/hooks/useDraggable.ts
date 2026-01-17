import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCallback } from 'react';

export const useDraggable = () => {
  const startDragging = useCallback(async () => {
    const appWindow = getCurrentWindow();
    await appWindow.startDragging();
  }, []);

  return { startDragging };
};
