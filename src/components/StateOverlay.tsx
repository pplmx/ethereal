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
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2"
      >
        {/* State indicator pill */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded-full glass-effect"
          whileHover={{ scale: 1.05 }}
          style={{
            boxShadow: `0 0 25px ${stateConfig.color}30, 0 4px 20px rgba(0, 0, 0, 0.3)`,
          }}
        >
          {/* Animated icon */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stateConfig.gradient} flex items-center justify-center text-xs shadow-lg`}
          >
            {stateConfig.icon}
          </motion.div>

          <span
            className="text-[10px] font-bold tracking-widest"
            style={{ color: stateConfig.color }}
          >
            {state.replace('_', ' ').toUpperCase()}
          </span>
        </motion.div>

        {/* Metrics container */}
        <motion.div
          className="flex items-center gap-3 px-3 py-2 rounded-full glass-effect"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* CPU meter */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/40 font-medium">CPU</span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    cpuPercent > 80
                      ? 'linear-gradient(90deg, #EF4444, #F97316)'
                      : cpuPercent > 50
                        ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                        : 'linear-gradient(90deg, #10B981, #34D399)',
                  boxShadow:
                    cpuPercent > 80
                      ? '0 0 10px rgba(239, 68, 68, 0.5)'
                      : cpuPercent > 50
                        ? '0 0 10px rgba(245, 158, 11, 0.5)'
                        : '0 0 10px rgba(16, 185, 129, 0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-white/70 tabular-nums font-medium w-6 text-right">
              {cpuPercent.toFixed(0)}%
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-white/10" />

          {/* Memory meter */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/40 font-medium">MEM</span>
            <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(memPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Mood emoji with glow */}
        <motion.div
          key={mood}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-xl filter drop-shadow-lg"
          whileHover={{ scale: 1.2, rotate: 15 }}
          style={{
            filter: `drop-shadow(0 0 8px ${stateConfig.color}60)`,
          }}
        >
          {getMoodEmoji(mood)}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
