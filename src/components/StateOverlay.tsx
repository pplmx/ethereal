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
        return { color: '#EF4444', icon: '🔥' };
      case 'highload':
      case 'high_load':
        return { color: '#F59E0B', icon: '⚡' };
      case 'working':
        return { color: '#10B981', icon: '💻' };
      case 'gaming':
        return { color: '#8B5CF6', icon: '🎮' };
      case 'thinking':
        return { color: '#06B6D4', icon: '💭' };
      case 'lowbattery':
      case 'low_battery':
        return { color: '#DC2626', icon: '🪫' };
      case 'sleeping':
        return { color: '#64748B', icon: '💤' };
      case 'browsing':
        return { color: '#0EA5E9', icon: '🌐' };
      default:
        return { color: '#6366F1', icon: '✨' };
    }
  };

  const stateConfig = getStateConfig(state);
  const cpuPercent = hardware?.utilization ?? 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${state}-${mood}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        {/* State indicator pill */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${stateConfig.color}20, ${stateConfig.color}10)`,
            border: `1px solid ${stateConfig.color}40`,
            boxShadow: `0 0 20px ${stateConfig.color}30`,
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm"
          >
            {stateConfig.icon}
          </motion.span>
          <span className="text-xs font-medium tracking-wide" style={{ color: stateConfig.color }}>
            {state.replace('_', ' ').toUpperCase()}
          </span>
        </motion.div>

        {/* CPU indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span className="text-[10px] text-white/50">CPU</span>
          <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  cpuPercent > 80
                    ? 'linear-gradient(90deg, #EF4444, #F97316)'
                    : cpuPercent > 50
                      ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                      : 'linear-gradient(90deg, #10B981, #34D399)',
              }}
              animate={{ width: `${Math.min(cpuPercent, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] text-white/70 tabular-nums w-7">
            {cpuPercent.toFixed(0)}%
          </span>
        </div>

        {/* Mood emoji */}
        <motion.div
          key={mood}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-xl filter drop-shadow-lg"
        >
          {getMoodEmoji(mood)}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
