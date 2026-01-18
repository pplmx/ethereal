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
import './App.css';
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
    toggleClickThrough,
  } = useSpriteStore();
  const { syncWithConfig } = useSoundStore();

  useEffect(() => {
    logger.info('App mounted');
    initSettings();

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      invoke('show_context_menu').catch((err) => {
        logger.debug('Context menu not available:', err);
      });
    };
    document.addEventListener('contextmenu', handleContextMenu);

    const unlisteners: (() => void)[] = [];

    const setupListeners = async () => {
      try {
        const unlistenSettings = await listen('open-settings', () => {
          setIsOpen(true);
        });
        unlisteners.push(unlistenSettings);

        const unlistenAbout = await listen('open-about', () => {
          alert('Ethereal v0.1.0\nA digital spirit living in your code.');
        });
        unlisteners.push(unlistenAbout);

        const unlistenShortcut = await listen('toggle-click-through-request', async () => {
          const currentIsClickThrough = useSpriteStore.getState().isClickThrough;
          const newState = !currentIsClickThrough;
          logger.info('Click-through toggle requested:', newState);
          try {
            await invoke('set_click_through', { enabled: newState });
            toggleClickThrough();
          } catch (e) {
            logger.error('Failed to set click-through:', e);
          }
        });
        unlisteners.push(unlistenShortcut);

        const unlistenClipboard = await listen<string>('clipboard-changed', async (event) => {
          const content = event.payload;
          const { state, mood, hardware: hw } = useSpriteStore.getState();

          logger.info('Clipboard changed detected');
          setThinking(true);
          setVisible(true);

          try {
            const system_context = `Current State: ${state}, Mood: ${mood}, CPU: ${
              hw?.utilization
            }%, Mem: ${hw?.memory_used}/${hw?.memory_total}MB, Net: ${
              hw?.network_rx
            }KB/s down, Bat: ${hw?.battery_level}% (${hw?.battery_state})`;

            const response = await invoke<string>('chat_with_ethereal', {
              message: content,
              systemContext: system_context,
              mood: mood,
            });
            showResponse(response);
          } catch (e) {
            logger.error('AI Chat failed:', e);
            showResponse("I'm having trouble connecting to my brain...");
          }
        });
        unlisteners.push(unlistenClipboard);

        const unlistenHardware = await listen<HardwareData>('gpu-update', (event) => {
          updateHardware(event.payload);
        });
        unlisteners.push(unlistenHardware);
      } catch (e) {
        logger.error('Failed to setup listeners', e);
      }
    };

    setupListeners();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [
    initSettings,
    setIsOpen,
    toggleClickThrough,
    setThinking,
    setVisible,
    showResponse,
    updateHardware,
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
    } else if (config?.interaction?.double_click_action === 'settings') {
      setIsOpen(true);
    }
  };

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-transparent flex flex-col items-center justify-center select-none p-4"
      onMouseDown={startDragging}
      onDoubleClick={handleDoubleClick}
    >
      <DevTools />
      <SettingsModal />

      <div className="relative flex flex-col items-center justify-center min-h-[300px] w-full">
        <div className="absolute top-0 w-full flex justify-center h-24">
          <SpeechBubble />
        </div>

        <motion.div
          className="relative mt-8"
          whileHover={config?.interaction?.enable_hover_effects ? { scale: 1.05 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <SpriteAnimator
            frames={getAnimationFrames()}
            fps={getCurrentFps()}
            loop={shouldLoop()}
            className="w-32 h-32 object-contain pointer-events-none drop-shadow-xl"
          />

          {getAnimationFrames().length === 0 && (
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full animate-pulse border border-white/30 flex items-center justify-center text-white/50 text-xs">
              No Sprites
            </div>
          )}
        </motion.div>

        <div className="absolute bottom-0 w-full flex justify-center h-12">
          <StateOverlay />
        </div>
      </div>
    </main>
  );
}

export default App;
