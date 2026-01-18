import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useResourceStore } from '../stores/resourceStore';

interface SpriteAnimatorProps {
  frames: string[];
  fps?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
  mood?: string;
}

export const SpriteAnimator = ({
  frames,
  fps = 12,
  loop = true,
  onAnimationEnd,
  className,
  mood = 'happy',
}: SpriteAnimatorProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const { preloadImages, isImageLoaded } = useResourceStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (frames.length === 0) return;
    let mounted = true;
    const allLoaded = frames.every(isImageLoaded);
    if (allLoaded) {
      setReady(true);
    } else {
      setReady(false);
      preloadImages(frames).then(() => {
        if (mounted) setReady(true);
      });
    }
    return () => {
      mounted = false;
    };
  }, [frames, isImageLoaded, preloadImages]);

  useEffect(() => {
    if (!ready || frames.length === 0) return;
    const frameInterval = 1000 / fps;
    const animate = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      if (deltaTime >= frameInterval) {
        setCurrentFrame((prev) => {
          const next = prev + 1;
          if (next >= frames.length) {
            if (!loop) {
              if (onAnimationEnd) onAnimationEnd();
              return prev;
            }
            return 0;
          }
          return next;
        });
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [ready, frames.length, fps, loop, onAnimationEnd]);

  const getAuraColor = (m: string) => {
    switch (m) {
      case 'excited':
        return 'bg-cyan-400';
      case 'angry':
        return 'bg-rose-500';
      case 'sad':
        return 'bg-blue-400';
      case 'tired':
        return 'bg-amber-600';
      default:
        return 'bg-indigo-500';
    }
  };

  if (frames.length === 0) return null;

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        key={mood}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={cn(
          'absolute inset-0 rounded-full blur-[40px] transition-colors duration-1000',
          getAuraColor(mood),
        )}
      />

      <div className="relative z-10 animate-spirit-float">
        {!ready ? (
          <div
            data-testid="loading-spinner"
            className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
          />
        ) : (
          <motion.img
            key={currentFrame}
            src={frames[currentFrame]}
            alt="Sprite"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className={cn(
              'w-full h-full object-contain pointer-events-none drop-shadow-2xl',
              className,
            )}
          />
        )}
      </div>
    </div>
  );
};
