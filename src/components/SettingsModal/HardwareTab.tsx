import { useSpriteStore } from '../../stores/spriteStore';
import type { SettingsTabProps } from './types';

export const HardwareTab = ({ formData, setFormData }: SettingsTabProps) => {
  const { hardware } = useSpriteStore();

  return (
    <div className="space-y-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
        <h3 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50 mb-3">
          Current Status
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-mono">CPU Usage</span>
            <span className="text-sm font-medium">{hardware?.utilization.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-mono">Temperature</span>
            <span className="text-sm font-medium">{hardware?.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-mono">Memory</span>
            <span className="text-sm font-medium">
              {hardware?.memory_used} / {hardware?.memory_total} MB
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] font-mono">Network</span>
            <span className="text-sm font-medium">↓ {hardware?.network_rx.toFixed(1)} KB/s</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50">
          Configuration
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1">
            Monitor Source
            <select
              value={formData.hardware.monitor_source}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hardware: { ...formData.hardware, monitor_source: e.target.value },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all [&>option]:bg-[#1a1a1a]"
            >
              <option value="auto">Auto</option>
              <option value="nvidia">NVIDIA</option>
              <option value="amd">AMD</option>
              <option value="cpu">CPU</option>
            </select>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Polling Interval (ms)
            <input
              type="number"
              value={formData.hardware.polling_interval_ms}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hardware: {
                    ...formData.hardware,
                    polling_interval_ms: Number.parseInt(e.target.value, 10) || 1000,
                  },
                })
              }
              className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
            />
          </label>
        </div>
        <div className="space-y-2">
          <h4 className="text-white/90 font-bold uppercase tracking-widest text-[10px] opacity-50">
            Thresholds
          </h4>
          <div>
            <label className="block text-sm font-medium mb-1">
              NVIDIA Temp Threshold (°C)
              <input
                type="number"
                value={formData.hardware.thresholds.nvidia_temp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hardware: {
                      ...formData.hardware,
                      thresholds: {
                        ...formData.hardware.thresholds,
                        nvidia_temp: Number.parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
