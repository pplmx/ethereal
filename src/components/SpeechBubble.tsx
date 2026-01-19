import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';

export const SpeechBubble = () => {
  const { message, isThinking, isVisible } = useChatStore();
  const [displayedText, setDisplayedText] = useState('');

  // Typewriter effect
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
    }, 30);

    return () => clearInterval(interval);
  }, [message, isThinking]);

  return (
    <AnimatePresence>
      {(isVisible || isThinking) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.85, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, scale: 0.85, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-[260px] pointer-events-none"
        >
          <div className="relative glass-effect p-4 rounded-2xl overflow-hidden">
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-50"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {isThinking ? (
              <div className="flex space-x-2.5 items-center justify-center py-3 relative z-10">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className="w-2.5 h-2.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"
                    style={{
                      boxShadow: '0 0 12px rgba(34, 211, 238, 0.6)',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="relative z-10">
                <p className="text-white text-sm font-medium leading-relaxed text-center min-h-[1.5em]">
                  {displayedText}
                  {displayedText.length < (message?.length || 0) && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 align-middle"
                    />
                  )}
                </p>
              </div>
            )}

            {/* Speech bubble tail with gradient */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 glass-effect border-t-0 border-l-0"
              style={{
                background:
                  'linear-gradient(135deg, transparent 50%, rgba(15, 23, 42, 0.8) 50%)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
