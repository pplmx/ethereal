import { cn } from '@lib/utils';
import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { useResourceStore } from '../stores/resourceStore';

interface SpriteAnimatorProps {
  frames: string[];
  fps?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
  mood?: string;
}

export const SpriteAnimator = memo(
  ({
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

    const getAuraConfig = (m: string) => {
      switch (m) {
        case 'excited':
          return {
            color: 'from-cyan-400 via-teal-400 to-emerald-400',
            shadow: 'shadow-cyan-500/50',
            intensity: 1.3,
          };
        case 'angry':
          return {
            color: 'from-rose-500 via-red-500 to-orange-500',
            shadow: 'shadow-rose-500/50',
            intensity: 1.4,
          };
        case 'sad':
          return {
            color: 'from-blue-400 via-indigo-400 to-violet-400',
            shadow: 'shadow-blue-500/40',
            intensity: 0.8,
          };
        case 'curious':
          return {
            color: 'from-amber-400 via-yellow-400 to-lime-400',
            shadow: 'shadow-amber-500/40',
            intensity: 1.1,
          };
        case 'tired':
          return {
            color: 'from-amber-500 via-orange-400 to-yellow-400',
            shadow: 'shadow-amber-500/30',
            intensity: 0.6,
          };
        case 'bored':
          return {
            color: 'from-slate-400 via-gray-400 to-zinc-400',
            shadow: 'shadow-slate-500/30',
            intensity: 0.5,
          };
        case 'sleeping':
          return {
            color: 'from-blue-900 via-indigo-900 to-slate-900',
            shadow: 'shadow-indigo-900/50',
            intensity: 0.3,
          };
        default:
          return {
            color: 'from-indigo-500 via-violet-500 to-purple-500',
            shadow: 'shadow-indigo-500/40',
            intensity: 1,
          };
      }
    };

    const aura = getAuraConfig(mood);

    if (frames.length === 0) return null;

    return (
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Outer aura ring - pulsing */}
        <motion.div
          key={`outer-${mood}`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{
            duration: 4 / aura.intensity,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(
            'absolute inset-[-30%] rounded-full blur-[60px] bg-gradient-to-br',
            aura.color,
          )}
        />

        {/* Inner aura - breathing */}
        <motion.div
          key={`inner-${mood}`}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3 / aura.intensity,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(
            'absolute inset-[-10%] rounded-full blur-[40px] bg-gradient-to-tr',
            aura.color,
          )}
        />

        {/* Floating particles */}
        {mood === 'excited' &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${60 + Math.random() * 20}%`,
              }}
              animate={{
                y: [-20, -80],
                x: [0, (Math.random() - 0.5) * 40],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}

        {/* Spark effects for angry mood */}
        {mood === 'angry' &&
          [...Array(4)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1 h-3 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full"
              style={{
                left: `${20 + i * 20}%`,
                top: '20%',
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

        {/* Floating Zzz for sleeping mood */}
        {mood === 'sleeping' &&
          [...Array(3)].map((_, i) => (
            <motion.div
              key={`zzz-${i}`}
              className="absolute text-indigo-300/60 font-bold select-none pointer-events-none"
              style={{
                right: `${15 + i * 12}%`,
                top: `${25 + i * 8}%`,
                fontSize: `${14 + i * 2}px`,
              }}
              animate={{
                y: [-10, -40],
                x: [0, 15],
                opacity: [0, 0.8, 0],
                scale: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 1,
                ease: 'easeOut',
              }}
            >
              Z
            </motion.div>
          ))}

        {/* Teardrop particles for sad mood */}
        {mood === 'sad' &&
          [...Array(3)].map((_, i) => (
            <motion.div
              key={`tear-${i}`}
              className="absolute w-2 h-3 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full"
              style={{
                left: `${35 + i * 15}%`,
                top: '40%',
              }}
              animate={{
                y: [0, 60],
                opacity: [0.8, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 1.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeIn',
              }}
            />
          ))}

        {/* Question mark particles for curious mood */}
        {mood === 'curious' &&
          [...Array(4)].map((_, i) => (
            <motion.div
              key={`question-${i}`}
              className="absolute text-amber-400/70 font-bold select-none pointer-events-none"
              style={{
                left: `${25 + i * 15}%`,
                top: `${50 + (i % 2) * 10}%`,
                fontSize: `${12 + i * 2}px`,
              }}
              animate={{
                y: [-5, -35],
                x: [(i % 2 === 0 ? -1 : 1) * 10, (i % 2 === 0 ? 1 : -1) * 10],
                opacity: [0, 0.9, 0],
                rotate: [0, i % 2 === 0 ? 15 : -15],
              }}
              transition={{
                duration: 2 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            >
              ?
            </motion.div>
          ))}

        {/* Sprite with floating animation */}
        <div className="relative z-10 animate-spirit-float w-full h-full flex items-center justify-center">
          {!ready ? (
            <div
              data-testid="loading-spinner"
              className="w-16 h-16 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"
            />
          ) : (
            <motion.img
              key={currentFrame}
              data-testid="sprite-animator"
              src={frames[currentFrame]}
              alt="Sprite"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.1 }}
              className={cn(
                'max-w-full max-h-full object-contain pointer-events-none',
                'drop-shadow-2xl',
                mood === 'excited' && 'glow-excited',
                mood === 'angry' && 'glow-angry',
                mood === 'sad' && 'glow-sad',
                mood === 'curious' && 'glow-curious',
                mood === 'tired' && 'glow-tired',
                mood === 'happy' && 'glow-happy',
                mood === 'sleeping' && 'glow-sleeping',
                className,
              )}
            />
          )}
        </div>
      </div>
    );
  },
);
