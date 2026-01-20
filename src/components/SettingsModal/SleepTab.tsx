import type { SettingsTabProps } from './types';

export const SleepTab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          Enable Sleep Mode
          <input
            type="checkbox"
            checked={formData.sleep.enabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                sleep: { ...formData.sleep, enabled: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white/60">
            Start Time
            <input
              type="time"
              value={formData.sleep.start_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sleep: { ...formData.sleep, start_time: e.target.value },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all mt-1"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-white/60">
            End Time
            <input
              type="time"
              value={formData.sleep.end_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sleep: { ...formData.sleep, end_time: e.target.value },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all mt-1"
            />
          </label>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5">
        <label className="block text-sm font-medium mb-1 text-white/60">
          Low Battery Threshold (%)
          <input
            type="number"
            value={formData.battery.low_battery_threshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                battery: {
                  ...formData.battery,
                  low_battery_threshold: Number.parseFloat(e.target.value) || 0,
                },
              })
            }
            className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all mt-1"
          />
        </label>
      </div>
    </div>
  );
};
