import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';

export const WelcomeModal = () => {
  const { config, updateConfig } = useSettingsStore();

  if (!config?.general?.first_launch) return null;

  const handleComplete = () => {
    if (config) {
      updateConfig({
        ...config,
        general: { ...config.general, first_launch: false },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-effect rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white relative"
      >
        <div className="h-40 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_70%)]" />
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.3)] relative z-10"
          >
            <span className="text-4xl">🔮</span>
          </motion.div>
        </div>

        <div className="p-8 text-center relative z-10">
          <h2 className="text-xl font-bold mb-3 tracking-widest uppercase text-indigo-300">Awaken the Spirit</h2>
          <p className="text-white/60 mb-8 leading-relaxed text-[13px] font-medium">
            I am your <strong className="text-white">Digital Soul</strong>. I'll flow with your
            system's rhythm and reside on your desktop.
          </p>

          <div className="space-y-5 mb-10 text-left">
            {[
              { id: 1, title: 'System Pulse', desc: 'I sense CPU, Memory, and Temperature to shift my mood.', color: 'bg-indigo-500/20 text-indigo-400' },
              { id: 2, title: 'Deep Learning', desc: 'Copy code or errors, and I\'ll offer my ethereal wisdom.', color: 'bg-purple-500/20 text-purple-400' },
              { id: 3, title: 'Vessel Shape', desc: 'Drag a folder of spirits to redefine my crystalline form.', color: 'bg-cyan-500/20 text-cyan-400' }
            ].map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-xl ${item.color} flex-shrink-0 flex items-center justify-center font-bold text-xs border border-white/5`}>
                  {item.id}
                </div>
                <div>
                  <p className="text-sm font-bold text-white/90">{item.title}</p>
                  <p className="text-[11px] text-white/40 leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 transition-all text-white text-xs font-bold tracking-[0.2em] uppercase rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            Awaken the Spirit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
