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
import { AnimatePresence, motion } from 'framer-motion';
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
      className="w-screen h-screen overflow-hidden bg-[#050508] select-none relative"
      onMouseDown={startDragging}
      onDoubleClick={handleDoubleClick}
    >
      {/* Background Layers - Parallax Deep Space */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [-20, 20, -20], y: [-15, 15, -15] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-20 mesh-layer-1 opacity-40 shadow-inner"
        />
        <motion.div
          animate={{ x: [20, -20, 20], y: [15, -15, 15] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-20 mesh-layer-2 opacity-30"
        />
      </div>

      <div className="absolute inset-0 ambient-vignette pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-[0.04] pointer-events-none" />

      {/* Spirit Dust / Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            initial={{
              x: Math.random() * 1000 % 800,
              y: Math.random() * 800 % 600,
              opacity: 0
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 rounded-full bg-indigo-300 blur-[1px]"
            style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%` }}
          />
        ))}
      </div>

      {/* Dynamic Streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ethereal-streak" style={{ top: '25%', animationDelay: '0s', height: '1px' }} />
        <div className="ethereal-streak" style={{ top: '65%', animationDelay: '5s', height: '1px' }} />
      </div>

      <DevTools />
      <SettingsModal />
      <WelcomeModal />

      {/* Ambient background glow */}
      <AnimatePresence>
        <motion.div
          key={spriteMood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${spriteMood === 'excited'
              ? 'rgba(6, 182, 212, 0.15)'
              : spriteMood === 'angry'
                ? 'rgba(244, 63, 94, 0.15)'
                : spriteMood === 'happy'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : spriteMood === 'tired'
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(99, 102, 241, 0.1)'
              }, transparent 70%)`,
          }}
        />
      </AnimatePresence>

      {/* Full-screen centered container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Speech bubble - above sprite */}
        <div className="mb-2 pointer-events-auto">
          <SpeechBubble />
        </div>

        {/* Sprite container with fixed size */}
        <motion.div
          className="relative pointer-events-auto"
          style={{ width: 180, height: 180 }}
          whileHover={config?.interaction?.enable_hover_effects ? {
            scale: 1.12,
            rotate: [0, -1, 1, -1, 0],
          } : {}}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 12,
            rotate: { duration: 0.5, repeat: Infinity, ease: "linear" }
          }}
        >
          {/* Orbital Rings / Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none opacity-40">
            <div className="orbital-ring w-full h-full" style={{ animationDuration: '15s', borderColor: 'rgba(99, 102, 241, 0.2)' }} />
            <div className="orbital-ring w-[80%] h-[80%]" style={{ animationDuration: '10s', animationDirection: 'reverse', borderColor: 'rgba(6, 182, 212, 0.15)' }} />
          </div>

          <SpriteAnimator
            frames={getAnimationFrames()}
            fps={getCurrentFps()}
            loop={shouldLoop()}
            mood={spriteMood}
            className="w-full h-full animate-spirit-float"
          />

          {getAnimationFrames().length === 0 && (
            <div className="absolute inset-0 glass-effect rounded-full animate-pulse flex items-center justify-center">
              <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] font-['Michroma']">INITIALIZING</span>
            </div>
          )}
        </motion.div>

        {/* State overlay - below sprite */}
        <div className="mt-8 pointer-events-auto min-w-max">
          <StateOverlay />
        </div>
      </div>
    </main>
  );
}

export default App;
