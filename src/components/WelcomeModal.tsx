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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-indigo-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800"
      >
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm animate-pulse">
            <span className="text-3xl text-white">✨</span>
          </div>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Welcome, Summoner!</h2>
          <p className="text-slate-600 mb-6 leading-relaxed text-sm">
            I am your <strong>Digital Spirit</strong>. I'll live on your desktop and react to your
            system's pulse.
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
                1
              </div>
              <div>
                <p className="text-sm font-semibold">System Aware</p>
                <p className="text-xs text-slate-500">
                  I monitor CPU, Memory, and Temperature to change my mood.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600 font-bold text-xs">
                2
              </div>
              <div>
                <p className="text-sm font-semibold">AI Interaction</p>
                <p className="text-xs text-slate-500">
                  Copy code snippets or errors, and I might give you some advice!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex-shrink-0 flex items-center justify-center text-cyan-600 font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-sm font-semibold">Custom Appearance</p>
                <p className="text-xs text-slate-500">
                  Drag and drop a folder of SVG sprites to change how I look.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20"
          >
            Awaken the Spirit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
