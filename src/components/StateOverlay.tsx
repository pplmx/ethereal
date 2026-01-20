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
      default:
        return '🙂';
    }
  };

  const getStateConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'overheating':
        return { color: '#EF4444', gradient: 'from-red-500 to-orange-500', icon: '🔥' };
      case 'highload':
      case 'high_load':
        return { color: '#F59E0B', gradient: 'from-amber-500 to-yellow-500', icon: '⚡' };
      case 'working':
        return { color: '#10B981', gradient: 'from-emerald-500 to-teal-500', icon: '💻' };
      case 'gaming':
        return { color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500', icon: '🎮' };
      case 'thinking':
        return { color: '#06B6D4', gradient: 'from-cyan-500 to-blue-500', icon: '💭' };
      case 'lowbattery':
      case 'low_battery':
        return { color: '#DC2626', gradient: 'from-red-600 to-rose-500', icon: '🪫' };
      case 'sleeping':
        return { color: '#64748B', gradient: 'from-slate-500 to-gray-500', icon: '💤' };
      case 'browsing':
        return { color: '#0EA5E9', gradient: 'from-sky-500 to-blue-500', icon: '🌐' };
      default:
        return { color: '#6366F1', gradient: 'from-indigo-500 to-violet-500', icon: '✨' };
    }
  };

  const stateConfig = getStateConfig(state);
  const cpuPercent = hardware?.utilization ?? 0;
  const memPercent =
    hardware?.memory_used && hardware?.memory_total
      ? (hardware.memory_used / hardware.memory_total) * 100
      : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${state}-${mood}`}
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-premium whitespace-nowrap w-fit"
        style={{
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${stateConfig.color}20`,
          minWidth: 'max-content',
        }}
      >
        {/* State indicator pill - Minimal version */}
        <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-2 h-2 rounded-full bg-gradient-to-br ${stateConfig.gradient} shadow-[0_0_10px_${stateConfig.color}]`}
          />
          <span
            className="text-[9px] font-black tracking-[0.25em] uppercase text-shimmer"
            style={{
              color: stateConfig.color,
              textShadow: `0 0 12px ${stateConfig.color}60`,
              backgroundImage: `linear-gradient(90deg, ${stateConfig.color}88 0%, #fff 50%, ${stateConfig.color}88 100%)`
            }}
          >
            {state.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Metrics Section */}
        <div className="flex items-center gap-4 px-2">
          {/* CPU meter */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/30 font-bold tracking-tighter">CPU</span>
            <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background:
                    cpuPercent > 80
                      ? 'linear-gradient(90deg, #F43F5E, #FB7185)'
                      : cpuPercent > 50
                        ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                        : 'linear-gradient(90deg, #10B981, #34D399)',
                  boxShadow:
                    cpuPercent > 50
                      ? `0 0 12px ${cpuPercent > 80 ? '#F43F5E' : '#F59E0B'}80`
                      : '0 0 8px rgba(16, 185, 129, 0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
                transition={{ duration: 1, ease: 'backOut' }}
              >
                {/* Inner highlight (liquid look) */}
                <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 pointer-events-none rounded-full blur-[1px]" />
              </motion.div>
            </div>
            <span className="text-[10px] text-white/60 tabular-nums font-medium min-w-[24px]">
              {cpuPercent.toFixed(0)}%
            </span>
          </div>

          {/* MEM meter */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/30 font-bold tracking-tighter">MEM</span>
            <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 relative"
                style={{
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(memPercent, 100)}%` }}
                transition={{ duration: 1, ease: 'backOut', delay: 0.2 }}
              >
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 pointer-events-none rounded-full blur-[1px]" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mood indicator */}
        <motion.div
          key={mood}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 ml-1"
        >
          <span className="text-sm filter contrast-[1.1]">{getMoodEmoji(mood)}</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
