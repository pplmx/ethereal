import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSpriteStore } from '../stores/spriteStore';

export const DevTools = () => {
  const [stats, setStats] = useState({ fps: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const { setIsOpen } = useSettingsStore();
  const { hardware } = useSpriteStore();

  useEffect(() => {
    if (import.meta.env.DEV) {
      let lastTime = performance.now();
      let frames = 0;

      const measureFPS = () => {
        frames++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
          setStats((prev) => ({ ...prev, fps: frames }));
          frames = 0;
          lastTime = now;
        }
        requestAnimationFrame(measureFPS);
      };
      measureFPS();
    }
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-3 left-3 z-50 pointer-events-auto"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 w-full hover:bg-white/5 transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-white/60">DEV</span>
          <span className="text-[10px] font-mono text-white/40 ml-auto">{stats.fps} fps</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-[8px] text-white/30 ml-1"
          >
            ▼
          </motion.span>
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="p-3 space-y-2">
                {hardware && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                    <span className="text-white/40">CPU</span>
                    <span className="text-white/70 text-right">
                      {hardware.utilization.toFixed(0)}%
                    </span>
                    <span className="text-white/40">Net</span>
                    <span className="text-white/70 text-right">
                      ↓{hardware.network_rx} ↑{hardware.network_tx}
                    </span>
                    <span className="text-white/40">State</span>
                    <span className="text-cyan-400 text-right">{hardware.state}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white/80 transition-all hover:bg-white/10"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  ⚙️ Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
