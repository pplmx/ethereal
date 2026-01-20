import type { SettingsTabProps } from './types';

export const PrivacyTab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer group">
          Share Active Window Title with AI
          <input
            type="checkbox"
            checked={formData.privacy.share_window_title}
            onChange={(e) =>
              setFormData({
                ...formData,
                privacy: { ...formData.privacy, share_window_title: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
        <p className="text-[11px] text-white/40 leading-relaxed italic">
          When enabled, the title of your currently active window will be sent to the AI context.
          This helps the spirit provide more relevant responses based on what you are doing.
        </p>
      </div>
    </div>
  );
};
