import { DevTools } from '@components/DevTools';
import { SettingsModal } from '@components/SettingsModal';
import { SpeechBubble } from '@components/SpeechBubble';
import { SpriteAnimator } from '@components/SpriteAnimator';
import { useDraggable } from '@hooks/useDraggable';
import { useWindowPosition } from '@hooks/useWindowPosition';
import { logger } from '@lib/logger';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';
import { type HardwareData, useSpriteStore } from './stores/spriteStore';

function App() {
  const { startDragging } = useDraggable();
  useWindowPosition();
  const { setThinking, showResponse, setVisible } = useChatStore();
  const { initialize: initSettings } = useSettingsStore();
  const { updateHardware, getAnimationFrames, getCurrentFps, shouldLoop } = useSpriteStore();

  useEffect(() => {
    logger.info('App mounted');
    initSettings();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    const setupClipboardListener = async () => {
      try {
        const unlisten = await listen<string>('clipboard-changed', async (event) => {
          const content = event.payload;
          logger.info('Clipboard changed detected');

          setThinking(true);
          setVisible(true);

          try {
            const response = await invoke<string>('chat_with_ethereal', { message: content });
            showResponse(response);
          } catch (e) {
            logger.error('AI Chat failed:', e);
            showResponse("I'm having trouble connecting to my brain...");
          }
        });
        return unlisten;
      } catch (e) {
        logger.error('Failed to setup clipboard listener', e);
        return undefined;
      }
    };

    const setupHardwareListener = async () => {
      try {
        const unlisten = await listen<HardwareData>('gpu-update', (event) => {
          updateHardware(event.payload);
        });
        return unlisten;
      } catch (e) {
        logger.error('Failed to setup hardware listener', e);
        return undefined;
      }
    };

    const clipboardUnlistenPromise = setupClipboardListener();
    const hardwareUnlistenPromise = setupHardwareListener();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      clipboardUnlistenPromise.then((unlisten) => unlisten?.());
      hardwareUnlistenPromise.then((unlisten) => unlisten?.());
    };
  }, [initSettings, setThinking, setVisible, showResponse, updateHardware]);

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-transparent flex items-center justify-center select-none"
      onMouseDown={startDragging}
    >
      <DevTools />
      <SettingsModal />

      <div className="relative w-full h-full flex items-center justify-center">
        <SpeechBubble />

        <SpriteAnimator
          frames={getAnimationFrames()}
          fps={getCurrentFps()}
          loop={shouldLoop()}
          className="w-48 h-48 object-contain pointer-events-none drop-shadow-xl"
        />

        {getAnimationFrames().length === 0 && (
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full animate-pulse border border-white/30 flex items-center justify-center text-white/50 text-xs">
            No Sprites
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
