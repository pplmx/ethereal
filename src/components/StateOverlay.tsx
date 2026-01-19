import { AnimatePresence, motion } from 'framer-motion';
import { useSpriteStore } from '../stores/spriteStore';

export const StateOverlay = () => {
  const { state, mood, hardware } = useSpriteStore();

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

  const getStateColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'overheating':
        return 'from-rose-500 to-orange-500';
      case 'highload':
      case 'high_load':
        return 'from-amber-500 to-yellow-500';
      case 'working':
        return 'from-emerald-500 to-teal-500';
      case 'gaming':
        return 'from-violet-500 to-purple-500';
      case 'thinking':
        return 'from-cyan-400 to-blue-500';
      case 'lowbattery':
      case 'low_battery':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-indigo-500 to-violet-500';
    }
  };

  const cpuPercent = hardware?.utilization ?? 0;

  return (
    <div className="w-full flex justify-center py-2 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state}-${mood}`}
          initial={{ opacity: 0, scale: 0.8, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, y: 10, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center gap-3 px-4 py-2 glass-effect rounded-full ring-1 ring-white/10">
            {/* State indicator with gradient */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStateColor(state)}`}
                style={{
                  boxShadow: '0 0 8px currentColor',
                }}
              />
              <span className="text-[10px] font-bold tracking-[0.12em] text-white/80 uppercase">
                {state.replace('_', ' ')}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* CPU mini indicator */}
            <div className="flex items-center gap-1.5">
              <div className="relative w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${cpuPercent > 80
                      ? 'from-rose-500 to-red-500'
                      : cpuPercent > 50
                        ? 'from-amber-500 to-yellow-500'
                        : 'from-emerald-500 to-teal-500'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[9px] font-medium text-white/60 tabular-nums">
                {cpuPercent.toFixed(0)}%
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            {/* Mood emoji with animation */}
            <motion.span
              key={mood}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="text-base filter drop-shadow-md"
              title={mood}
            >
              {getMoodEmoji(mood)}
            </motion.span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
