import { DevTools } from '@components/DevTools';
import { SpriteAnimator } from '@components/SpriteAnimator';
import { useDraggable } from '@hooks/useDraggable';
import { useWindowPosition } from '@hooks/useWindowPosition';
import { logger } from '@lib/logger';
import { useEffect } from 'react';

function App() {
  const { startDragging } = useDraggable();
  useWindowPosition();

  const idleFrames = [
    '/sprites/idle-1.png',
    '/sprites/idle-2.png',
    '/sprites/idle-3.png',
    '/sprites/idle-4.png',
  ];

  useEffect(() => {
    logger.info('App mounted');

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <main
      className="w-screen h-screen overflow-hidden bg-transparent flex items-center justify-center select-none"
      onMouseDown={startDragging}
    >
      <DevTools />

      <div className="relative w-full h-full flex items-center justify-center">
        <SpriteAnimator
          frames={idleFrames}
          fps={8}
          className="w-48 h-48 object-contain pointer-events-none drop-shadow-xl"
        />

        {idleFrames.length === 0 && (
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full animate-pulse border border-white/30 flex items-center justify-center text-white/50 text-xs">
            No Sprites
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
