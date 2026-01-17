import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from '../stores/chatStore';

export const SpeechBubble = () => {
  const { message, isThinking, isVisible } = useChatStore();

  return (
    <AnimatePresence>
      {(isVisible || isThinking) && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 max-w-[200px] z-50"
        >
          <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-3 rounded-2xl shadow-lg border border-white/50 text-sm font-medium relative">
            {isThinking ? (
              <div className="flex space-x-1 items-center justify-center h-5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            ) : (
              message
            )}

            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 border-r border-b border-white/50 transform rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
