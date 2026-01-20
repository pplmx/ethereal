import { useMonitorStore } from '../../stores/monitorStore';
import type { SettingsTabProps } from './types';

export const WindowTab = ({ formData, setFormData }: SettingsTabProps) => {
  const { monitors, moveToMonitor } = useMonitorStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          Always On Top
          <input
            type="checkbox"
            checked={formData.window.always_on_top}
            onChange={(e) =>
              setFormData({
                ...formData,
                window: { ...formData.window, always_on_top: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
          Launch at Login (Autostart)
          <input
            type="checkbox"
            checked={formData.autostart.enabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                autostart: { ...formData.autostart, enabled: e.target.checked },
              })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50">
          Monitors
        </h3>
        <div className="grid gap-2">
          {monitors.map((m, idx) => (
            <div
              key={m.name || idx}
              className="border-white/10 hover:bg-white/5 transition-all text-white/90 bg-white/5 backdrop-blur-sm rounded-xl p-4 border flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  Monitor {idx + 1}
                  {m.is_primary && (
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter">
                      Primary
                    </span>
                  )}
                  {formData.window.target_monitor === m.name && (
                    <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-white/40 text-[10px] font-mono mt-1">
                  {m.size[0]}x{m.size[1]} @ {m.position[0]},{m.position[1]}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold text-[10px] tracking-wider uppercase"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveToMonitor(idx);
                  }}
                >
                  Move Here
                </button>
                <button
                  type="button"
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    formData.window.target_monitor === m.name
                      ? 'text-gray-400 cursor-default'
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.name) {
                      setFormData({
                        ...formData,
                        window: { ...formData.window, target_monitor: m.name },
                      });
                    }
                  }}
                >
                  {formData.window.target_monitor === m.name ? 'Is Default' : 'Set Default'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Default X
            <input
              type="number"
              value={formData.window.default_x}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  window: {
                    ...formData.window,
                    default_x: Number.parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Default Y
            <input
              type="number"
              value={formData.window.default_y}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  window: {
                    ...formData.window,
                    default_y: Number.parseInt(e.target.value, 10) || 0,
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
