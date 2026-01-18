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
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state}-${mood}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex flex-col items-center"
        >
          <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
            <span className="text-[10px] text-white/90 font-medium uppercase tracking-wider">
              {state.replace('_', ' ')}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs" title={mood}>
              {getMoodEmoji(mood)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
