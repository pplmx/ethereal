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

  const features = [
    {
      id: 1,
      icon: '💫',
      title: 'System Pulse',
      desc: 'I sense CPU, Memory, and Temperature to shift my mood.',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      id: 2,
      icon: '🧠',
      title: 'Deep Learning',
      desc: "Copy code or errors, and I'll offer my ethereal wisdom.",
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 3,
      icon: '✨',
      title: 'Vessel Shape',
      desc: 'Drag a folder of spirits to redefine my crystalline form.',
      gradient: 'from-cyan-500 to-teal-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-2xl">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-premium rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white relative neon-border"
      >
        {/* Header with animated orb */}
        <div className="h-44 relative overflow-hidden">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 mesh-gradient" />

          {/* Animated rings */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-indigo-500/30"
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-violet-500/20"
          />

          {/* Central orb */}
          <motion.div
            animate={{
              y: [0, -12, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2))',
              boxShadow:
                '0 0 60px rgba(99, 102, 241, 0.4), 0 0 120px rgba(139, 92, 246, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span className="text-5xl filter drop-shadow-lg">🔮</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2 tracking-[0.1em] bg-gradient-to-r from-indigo-300 via-violet-100 to-purple-300 bg-clip-text text-transparent font-['Michroma'] text-bloom"
          >
            Awaken the Spirit
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 mb-8 leading-relaxed text-sm font-light tracking-wide"
          >
            I am your <span className="text-white font-medium">Digital Soul</span>. I'll flow with
            your system's rhythm and reside on your desktop.
          </motion.p>

          {/* Feature cards */}
          <div className="space-y-4 mb-10">
            {features.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 group border border-white/5 hover:border-white/10"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 flex items-center justify-center text-lg shadow-lg`}
                >
                  {item.icon}
                </motion.div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white/90 group-hover:text-white transition-colors tracking-widest uppercase font-['Michroma']">
                    {item.title}
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed mt-0.5 group-hover:text-white/50 transition-colors">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            type="button"
            onClick={handleComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 btn-premium text-white text-sm font-bold tracking-widest uppercase rounded-2xl"
          >
            <span className="relative z-10">Awaken the Spirit</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
