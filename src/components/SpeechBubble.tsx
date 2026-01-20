import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useSpriteStore } from '../stores/spriteStore';

export const SpeechBubble = () => {
  const { message, isThinking, isVisible } = useChatStore();
  const { mood } = useSpriteStore();
  const [displayedText, setDisplayedText] = useState('');

  const getMoodColor = (m: string) => {
    switch (m) {
      case 'excited':
        return 'rgba(6, 182, 212, 0.4)';
      case 'angry':
        return 'rgba(244, 63, 94, 0.4)';
      case 'happy':
        return 'rgba(99, 102, 241, 0.4)';
      case 'tired':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(99, 102, 241, 0.3)';
    }
  };

  const moodColor = getMoodColor(mood);

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
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative max-w-[280px] pointer-events-none"
        >
          {/* Main Bubble */}
          <div
            className="glass-effect rounded-2xl px-5 py-4 relative z-10 overflow-hidden"
            style={{
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px ${moodColor}`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${moodColor}, transparent)`,
              }}
            />

            {isThinking ? (
              <div className="flex space-x-2 items-center justify-center py-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: moodColor.replace('0.4', '1').replace('0.3', '1') }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white/90 text-[13px] font-medium leading-relaxed tracking-tight text-center">
                {displayedText}
                {displayedText.length < (message?.length || 0) && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-[1.5px] h-3 ml-0.5 align-middle"
                    style={{ background: moodColor.replace('0.4', '1').replace('0.3', '1') }}
                  />
                )}
              </p>
            )}
          </div>

          {/* Tail */}
          <div className="flex justify-center -mt-px relative z-0">
            <div
              className="w-4 h-3"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
