import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import { useSpriteStore } from '../stores/spriteStore';

export const DevTools = () => {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
  });
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-3 right-3 z-50 pointer-events-auto"
    >
      <div className="glass-effect rounded-xl overflow-hidden shadow-2xl">
        {/* Collapsed header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-white/70">DEV</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
            <span>{stats.fps} FPS</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-white/30"
            >
              ▼
            </motion.span>
          </div>
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                  <div className="text-white/40">Memory</div>
                  <div className="text-white/70 text-right">
                    {(performance as any).memory?.usedJSHeapSize >> 20 || 0}MB
                  </div>

                  {hardware && (
                    <>
                      <div className="text-white/40">CPU</div>
                      <div className="text-white/70 text-right">
                        {hardware.utilization.toFixed(1)}%
                      </div>

                      <div className="text-white/40">Net ↓↑</div>
                      <div className="text-white/70 text-right">
                        {hardware.network_rx}/{hardware.network_tx} KB/s
                      </div>

                      <div className="text-white/40">Disk R/W</div>
                      <div className="text-white/70 text-right">
                        {hardware.disk_read}/{hardware.disk_write} KB/s
                      </div>

                      {hardware.battery_state !== 'N/A' && (
                        <>
                          <div className="text-white/40">Battery</div>
                          <div className="text-white/70 text-right">
                            {hardware.battery_level.toFixed(0)}% ({hardware.battery_state})
                          </div>
                        </>
                      )}

                      <div className="text-cyan-400/60">State</div>
                      <div className="text-cyan-400 text-right">{hardware.state}</div>
                    </>
                  )}
                </div>

                {/* Settings button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white transition-all shadow-lg shadow-indigo-500/20"
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
