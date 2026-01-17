import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@lib/utils';

interface SpriteAnimatorProps {
  frames: string[];
  fps?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
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
  const frameTimeoutRef = useRef<number>();

  // 预加载所有帧
  useEffect(() => {
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
    });

    return () => {
      frames.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = null;
      });
    };
  }, [frames]);

  // 帧动画循环
  useEffect(() => {
    if (!isLoaded) return;

    const frameDelay = 1000 / fps;

    const nextFrame = () => {
      setCurrentFrame((prev) => {
        const next = prev + 1;

        // 到达最后一帧
        if (next >= frames.length) {
          if (!loop) {
            onAnimationEnd?.();
            return prev; // 停在最后一帧
          }
          return 0; // 循环到第一帧
        }

        return next;
      });
    };

    frameTimeoutRef.current = window.setTimeout(nextFrame, frameDelay);

    return () => {
      if (frameTimeoutRef.current) {
        clearTimeout(frameTimeoutRef.current);
      }
    };
  }, [currentFrame, fps, frames.length, loop, onAnimationEnd, isLoaded]);

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
