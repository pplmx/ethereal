import type { SettingsTabProps } from './types';

export const SoundTab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          Enable Sound
          <input
            type="checkbox"
            checked={formData.sound.enabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                sound: { ...formData.sound, enabled: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Volume ({Math.round(formData.sound.volume * 100)}%)
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={formData.sound.volume}
            onChange={(e) =>
              setFormData({
                ...formData,
                sound: { ...formData.sound, volume: Number.parseFloat(e.target.value) },
              })
            }
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </label>
      </div>
    </div>
  );
};
