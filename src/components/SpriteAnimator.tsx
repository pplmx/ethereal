import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface SpriteAnimatorProps {
  frames: string[];
  fps?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
  draggable?: boolean;
}

export const SpriteAnimator = ({
  frames,
  fps = 12,
  loop = true,
  onAnimationEnd,
  className,
}: SpriteAnimatorProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (frames.length === 0) {
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalFrames = frames.length;

    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };
      if (img.complete && img.naturalWidth > 0) {
        img.onload(new Event('load'));
      }
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsLoaded(true);
        }
      };
    });
  }, [frames]);

  useEffect(() => {
    if (!isLoaded || frames.length === 0) return;

    const frameInterval = 1000 / fps;

    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

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
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, frames.length, fps, loop, onAnimationEnd]);

  if (frames.length === 0) return null;

  if (!isLoaded) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <motion.img
      src={frames[currentFrame]}
      alt="Sprite animation"
      className={cn('pointer-events-none select-none', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
