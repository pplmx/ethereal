import type { SettingsTabProps } from './types';

export const HotkeysTab = ({ formData, setFormData }: SettingsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50">
          Global Shortcuts
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1">
            Toggle Click-through
            <input
              type="text"
              value={formData.hotkeys.toggle_click_through}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hotkeys: {
                    ...formData.hotkeys,
                    toggle_click_through: e.target.value,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
              placeholder="Ctrl+Shift+E"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Quit Application
            <input
              type="text"
              value={formData.hotkeys.quit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hotkeys: { ...formData.hotkeys, quit: e.target.value },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
              placeholder="Ctrl+Shift+Q"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50">
          Mouse Interactions
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1">
            Double-click Action
            <select
              value={formData.interaction.double_click_action}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interaction: {
                    ...formData.interaction,
                    double_click_action: e.target.value,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all [&>option]:bg-[#1a1a1a]"
            >
              <option value="none">None</option>
              <option value="chat">Trigger AI Chat</option>
              <option value="settings">Open Settings</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
            Enable Hover Effects
            <input
              type="checkbox"
              checked={formData.interaction.enable_hover_effects}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interaction: {
                    ...formData.interaction,
                    enable_hover_effects: e.target.checked,
                  },
                })
              }
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <p className="text-white/40 text-[10px] font-mono mt-4 italic">
        Note: Use standard accelerator format for hotkeys (e.g., Ctrl+Shift+Alt+K).
      </p>
    </div>
  );
};
