import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useSpriteStore } from '../stores/spriteStore';

export const SpeechBubble = () => {
  const { message, isThinking, isVisible } = useChatStore();
  const { mood } = useSpriteStore();
  const [displayedText, setDisplayedText] = useState('');

  const getMoodConfig = (m: string) => {
    switch (m) {
      case 'excited':
        return {
          color: 'rgba(6, 182, 212, 0.6)',
          gradient: 'from-cyan-400 to-teal-400',
          glow: 'rgba(6, 182, 212, 0.4)',
        };
      case 'angry':
        return {
          color: 'rgba(244, 63, 94, 0.6)',
          gradient: 'from-rose-400 to-red-400',
          glow: 'rgba(244, 63, 94, 0.4)',
        };
      case 'happy':
        return {
          color: 'rgba(99, 102, 241, 0.6)',
          gradient: 'from-indigo-400 to-violet-400',
          glow: 'rgba(99, 102, 241, 0.4)',
        };
      case 'tired':
        return {
          color: 'rgba(245, 158, 11, 0.5)',
          gradient: 'from-amber-400 to-orange-400',
          glow: 'rgba(245, 158, 11, 0.3)',
        };
      default:
        return {
          color: 'rgba(99, 102, 241, 0.5)',
          gradient: 'from-indigo-400 to-purple-400',
          glow: 'rgba(99, 102, 241, 0.3)',
        };
    }
  };

  const moodConfig = getMoodConfig(mood);

  useEffect(() => {
    if (!message || isThinking) {
      setDisplayedText('');
      return;
    }

    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [message, isThinking]);

  return (
    <AnimatePresence>
      {(isVisible || isThinking) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[300px] pointer-events-none"
        >
          {/* Main Bubble with enhanced glass effect */}
          <div
            className="glass-premium rounded-2xl px-6 py-4 relative z-10 overflow-hidden mesh-gradient"
            style={{
              boxShadow: `0 12px 48px rgba(0, 0, 0, 0.6), 0 0 30px ${moodConfig.glow}`,
              border: `1px solid ${moodConfig.color}40`,
            }}
          >
            {/* Animated top border */}
            <motion.div
              animate={{
                backgroundPosition: ['0% center', '200% center'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${moodConfig.color}, transparent)`,
                backgroundSize: '200% 100%',
              }}
            />

            {/* Corner accents */}
            <div
              className="absolute top-0 left-0 w-8 h-8 opacity-30"
              style={{
                background: `radial-gradient(circle at 0% 0%, ${moodConfig.color}, transparent 70%)`,
              }}
            />
            <div
              className="absolute top-0 right-0 w-8 h-8 opacity-30"
              style={{
                background: `radial-gradient(circle at 100% 0%, ${moodConfig.color}, transparent 70%)`,
              }}
            />

            {isThinking ? (
              <div className="flex space-x-2.5 items-center justify-center py-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 1, 0.3],
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${moodConfig.gradient}`}
                    style={{
                      boxShadow: `0 0 10px ${moodConfig.glow}`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white/95 text-[14px] font-light leading-relaxed tracking-wide text-center">
                {displayedText}
                {displayedText.length < (message?.length || 0) && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full bg-gradient-to-b ${moodConfig.gradient}`}
                    style={{
                      boxShadow: `0 0 8px ${moodConfig.glow}`,
                    }}
                  />
                )}
              </p>
            )}
          </div>

          {/* Enhanced tail with gradient */}
          <div className="flex justify-center -mt-px relative z-0">
            <div
              className="w-5 h-4 relative"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(30, 35, 60, 0.95), rgba(20, 25, 45, 0.9))',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${moodConfig.glow}, transparent)`,
                  opacity: 0.3,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
