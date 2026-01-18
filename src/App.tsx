import { DevTools } from '@components/DevTools';
import { SettingsModal } from '@components/SettingsModal';
import { SpeechBubble } from '@components/SpeechBubble';
import { SpriteAnimator } from '@components/SpriteAnimator';
import { StateOverlay } from '@components/StateOverlay';
import { useDraggable } from '@hooks/useDraggable';
import { useWindowPosition } from '@hooks/useWindowPosition';
import { logger } from '@lib/logger';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';
import { useSoundStore } from './stores/soundStore';
import { type HardwareData, useSpriteStore } from './stores/spriteStore';

function App() {
  const { startDragging } = useDraggable();
  useWindowPosition();
  useSoundEffects();
  const { setThinking, showResponse, setVisible } = useChatStore();
  const { initialize: initSettings, config, setIsOpen } = useSettingsStore();
  const {
    updateHardware,
    getAnimationFrames,
    getCurrentFps,
    shouldLoop,
    state: spriteState,
    mood: spriteMood,
    hardware,
    isClickThrough,
    toggleClickThrough,
  } = useSpriteStore();
  const { syncWithConfig } = useSoundStore();

  useEffect(() => {
    logger.info('App mounted');
    initSettings();

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      invoke('show_context_menu');
    };
    document.addEventListener('contextmenu', handleContextMenu);

    const setupMenuListeners = async () => {
      try {
        const unlistenSettings = await listen('open-settings', () => {
          setIsOpen(true);
        });
        const unlistenAbout = await listen('open-about', () => {
          alert('Ethereal v0.1.0\nA digital spirit living in your code.');
        });
        return () => {
          unlistenSettings();
          unlistenAbout();
        };
      } catch (e) {
        logger.error('Failed to setup menu listeners', e);
        return () => {};
      }
    };

    const setupShortcutListener = async () => {
      try {
        const unlisten = await listen('toggle-click-through-request', async () => {
          const newState = !isClickThrough;
          logger.info('Click-through toggle requested:', newState);
          try {
            await invoke('set_click_through', { enabled: newState });
            toggleClickThrough();
          } catch (e) {
            logger.error('Failed to set click-through:', e);
          }
        });
        return unlisten;
      } catch (e) {
        logger.error('Failed to setup shortcut listener', e);
        return undefined;
      }
    };

    const setupClipboardListener = async () => {
      try {
        const unlisten = await listen<string>('clipboard-changed', async (event) => {
          const content = event.payload;
          logger.info('Clipboard changed detected');

          setThinking(true);
          setVisible(true);

          try {
            const system_context = `Current State: ${spriteState}, Mood: ${spriteMood}, CPU: ${
              hardware?.utilization
            }%, Mem: ${hardware?.memory_used}/${hardware?.memory_total}MB, Net: ${
              hardware?.network_rx
            }KB/s down, Bat: ${hardware?.battery_level}% (${hardware?.battery_state})`;
            const response = await invoke<string>('chat_with_ethereal', {
              message: content,
              systemContext: system_context,
              mood: spriteMood,
            });
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

    const menuUnlistenPromise = setupMenuListeners();
    const shortcutUnlistenPromise = setupShortcutListener();
    const clipboardUnlistenPromise = setupClipboardListener();
    const hardwareUnlistenPromise = setupHardwareListener();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      menuUnlistenPromise.then((unlisten) => unlisten?.());
      shortcutUnlistenPromise.then((unlisten) => unlisten?.());
      clipboardUnlistenPromise.then((unlisten) => unlisten?.());
      hardwareUnlistenPromise.then((unlisten) => unlisten?.());
    };
  }, [
    initSettings,
    setThinking,
    setVisible,
    showResponse,
    updateHardware,
    spriteState,
    spriteMood,
    hardware?.utilization,
    hardware?.memory_used,
    hardware?.memory_total,
    hardware?.network_rx,
    hardware?.battery_level,
    hardware?.battery_state,
    isClickThrough,
    toggleClickThrough,
    setIsOpen,
  ]);

  useEffect(() => {
    if (config?.sound) {
      syncWithConfig(config.sound);
    }
  }, [config, syncWithConfig]);

  const handleDoubleClick = async () => {
    if (config?.interaction?.double_click_action === 'chat') {
      setThinking(true);
      setVisible(true);
      try {
        const system_context = `Current State: ${spriteState}, Mood: ${spriteMood}, CPU: ${
          hardware?.utilization
        }%, Mem: ${hardware?.memory_used}/${hardware?.memory_total}MB, Net: ${
          hardware?.network_rx
        }KB/s down, Bat: ${hardware?.battery_level}% (${hardware?.battery_state})`;

        const response = await invoke<string>('chat_with_ethereal', {
          message: 'Hello! I just double-clicked you.',
          systemContext: system_context,
          mood: spriteMood,
        });
        showResponse(response);
      } catch (e) {
        logger.error('AI Chat failed on double click:', e);
        showResponse('You tickle! But my brain is currently offline.');
      }
    }
  };

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-transparent flex items-center justify-center select-none"
      onMouseDown={startDragging}
      onDoubleClick={handleDoubleClick}
    >
      <DevTools />
      <SettingsModal />

      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        whileHover={config?.interaction?.enable_hover_effects ? { scale: 1.05 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <SpeechBubble />
        <StateOverlay />

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
      </motion.div>
    </main>
  );
}

export default App;
