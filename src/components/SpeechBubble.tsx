import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';

export const SpeechBubble = () => {
  const { message, isThinking, isVisible } = useChatStore();

  return (
    <AnimatePresence>
      {(isVisible || isThinking) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-[240px] pointer-events-none"
        >
          <div className="relative glass-effect p-4 rounded-2xl shadow-indigo-500/20">
            {isThinking ? (
              <div className="flex space-x-2 items-center justify-center py-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"
                  />
                ))}
              </div>
            ) : (
              <p className="text-white text-sm font-medium leading-relaxed text-center">
                {message}
              </p>
            )}

            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 glass-effect rotate-45 border-t-0 border-l-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
