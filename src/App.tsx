import { DevTools } from '@components/DevTools';
import { SettingsModal } from '@components/SettingsModal';
import { SpeechBubble } from '@components/SpeechBubble';
import { SpriteAnimator } from '@components/SpriteAnimator';
import { StateOverlay } from '@components/StateOverlay';
import { WelcomeModal } from '@components/WelcomeModal';
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
  const { setThinking, showResponse, setVisible, addToHistory, history } = useChatStore();
  const { initialize: initSettings, config, setIsOpen, updateConfig } = useSettingsStore();
  const {
    updateHardware,
    getAnimationFrames,
    getCurrentFps,
    shouldLoop,
    state: spriteState,
    mood: spriteMood,
    hardware,
    toggleClickThrough,
    setCustomSpritePath,
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
          const { history: chatHistory } = useChatStore.getState();

          logger.info('Clipboard changed detected');
          setThinking(true);
          setVisible(true);
          addToHistory('user', content);

          try {
            const system_context = `Current State: ${state}, Mood: ${mood}, CPU: ${hw?.utilization
              }%, Mem: ${hw?.memory_used}/${hw?.memory_total}MB, Net: ${hw?.network_rx
              }KB/s down, Bat: ${hw?.battery_level}% (${hw?.battery_state})`;

            const response = await invoke<string>('chat_with_ethereal', {
              message: content,
              history: chatHistory,
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

        const unlistenDragDrop = await listen<string[]>('tauri://drag-drop', (event) => {
          const paths = event.payload;
          if (paths && paths.length > 0) {
            const firstPathRaw = paths[0];
            if (!firstPathRaw) return;
            let firstPath = firstPathRaw;

            if (firstPath.includes('.') && (firstPath.includes('/') || firstPath.includes('\\'))) {
              const lastSlash = Math.max(firstPath.lastIndexOf('/'), firstPath.lastIndexOf('\\'));
              if (lastSlash > 0) {
                firstPath = firstPath.substring(0, lastSlash);
              }
            }

            logger.info('File/Folder dropped, updating sprite path:', firstPath);
            if (config) {
              updateConfig({
                ...config,
                interaction: { ...config.interaction, custom_sprite_path: firstPath },
              });
              showResponse('Ooooh, new clothes? Let me try this on!');
            }
          }
        });
        unlisteners.push(unlistenDragDrop);
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
    addToHistory,
    config,
    updateConfig,
  ]);

  useEffect(() => {
    if (config?.sound) {
      syncWithConfig(config.sound);
    }
    if (config?.interaction?.custom_sprite_path) {
      setCustomSpritePath(config.interaction.custom_sprite_path);
    }
  }, [config, syncWithConfig, setCustomSpritePath]);

  const handleDoubleClick = async () => {
    if (config?.interaction?.double_click_action === 'chat') {
      const message = 'Hello! I just double-clicked you.';
      setThinking(true);
      setVisible(true);
      addToHistory('user', message);
      try {
        const system_context = `Current State: ${spriteState}, Mood: ${spriteMood}, CPU: ${hardware?.utilization
          }%, Mem: ${hardware?.memory_used}/${hardware?.memory_total}MB, Net: ${hardware?.network_rx
          }KB/s down, Bat: ${hardware?.battery_level}% (${hardware?.battery_state})`;

        const response = await invoke<string>('chat_with_ethereal', {
          message: message,
          history: history,
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
      className="w-screen h-screen overflow-hidden bg-transparent select-none relative"
      onMouseDown={startDragging}
      onDoubleClick={handleDoubleClick}
    >
      {/* DevTools - top right corner */}
      <DevTools />
      <SettingsModal />
      <WelcomeModal />

      {/* Centered content container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Speech bubble */}
          <SpeechBubble />

          {/* Sprite */}
          <motion.div
            className="relative"
            whileHover={config?.interaction?.enable_hover_effects ? { scale: 1.08 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <SpriteAnimator
              frames={getAnimationFrames()}
              fps={getCurrentFps()}
              loop={shouldLoop()}
              mood={spriteMood}
              className="w-32 h-32"
            />

            {getAnimationFrames().length === 0 && (
              <div className="w-32 h-32 glass-effect rounded-full animate-pulse flex items-center justify-center">
                <span className="text-white/40 text-xs">No Sprites</span>
              </div>
            )}
          </motion.div>

          {/* State overlay */}
          <StateOverlay />
        </div>
      </div>
    </main>
  );
}

export default App;
