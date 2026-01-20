import type { SettingsTabProps } from './types';

export const AITab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Model Name
          <input
            type="text"
            value={formData.ai.model_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                ai: { ...formData.ai, model_name: e.target.value },
              })
            }
            className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            placeholder="llama3.2"
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          API Endpoint
          <input
            type="text"
            value={formData.ai.api_endpoint}
            onChange={(e) =>
              setFormData({
                ...formData,
                ai: { ...formData.ai, api_endpoint: e.target.value },
              })
            }
            className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            placeholder="http://localhost:11434"
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          System Prompt
          <textarea
            value={formData.ai.system_prompt}
            onChange={(e) =>
              setFormData({
                ...formData,
                ai: { ...formData.ai, system_prompt: e.target.value },
              })
            }
            className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all h-24 resize-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cooldown (s)
            <input
              type="number"
              value={formData.ai.cooldown_seconds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ai: {
                    ...formData.ai,
                    cooldown_seconds: Number.parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Boredom Threshold (%)
            <input
              type="number"
              value={formData.mood.boredom_threshold_cpu}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mood: {
                    ...formData.mood,
                    boredom_threshold_cpu: Number.parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
