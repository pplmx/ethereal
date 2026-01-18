import { AnimatePresence, motion } from 'framer-motion';
import { useSpriteStore } from '../stores/spriteStore';

export const StateOverlay = () => {
  const { state, mood } = useSpriteStore();

  const getMoodEmoji = (m: string) => {
    switch (m) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🤩';
      case 'tired':
        return '😴';
      case 'bored':
        return '😐';
      case 'angry':
        return '😡';
      case 'sad':
        return '😢';
      default:
        return '🙂';
    }
  };

  return (
    <div className="w-full flex justify-center py-2 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state}-${mood}`}
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center gap-2.5 px-4 py-1.5 glass-effect rounded-full shadow-lg ring-1 ring-white/5">
            <span className="text-[10px] font-bold tracking-[0.15em] text-indigo-200 uppercase">
              {state.replace('_', ' ')}
            </span>
            <div className="w-1 h-1 rounded-full bg-indigo-400/40 shadow-[0_0_5px_#818cf8]" />
            <span className="text-sm filter drop-shadow-md" title={mood}>
              {getMoodEmoji(mood)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
