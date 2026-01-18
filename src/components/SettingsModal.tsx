import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMonitorStore } from '../stores/monitorStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { AppConfig } from '../types/config';
import { AnimationPreview } from './AnimationPreview';

export const SettingsModal = () => {
  const { isOpen, setIsOpen, config, updateConfig, loadConfig } = useSettingsStore();
  const { monitors, fetchMonitors, moveToMonitor } = useMonitorStore();
  const [formData, setFormData] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<
    'window' | 'hardware' | 'ai' | 'sound' | 'sprite' | 'hotkeys'
  >('window');

  useEffect(() => {
    if (isOpen) {
      if (!config) {
        loadConfig();
      }
      fetchMonitors();
    }
  }, [isOpen, config, loadConfig, fetchMonitors]);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = () => {
    if (formData) {
      updateConfig(formData);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (config) {
      setFormData(config);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 text-slate-800 flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                type="button"
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b overflow-x-auto">
              {(['window', 'hardware', 'ai', 'sound', 'sprite', 'hotkeys'] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium capitalize whitespace-nowrap px-4 ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'window' && (
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

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Monitors
                    </h3>
                    <div className="grid gap-2">
                      {monitors.map((m, idx) => (
                        <div
                          key={m.name || idx}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              Monitor {idx + 1}
                              {m.is_primary && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                  Primary
                                </span>
                              )}
                              {formData.window.target_monitor === m.name && (
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {m.size[0]}x{m.size[1]} @ {m.position[0]},{m.position[1]}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs text-blue-600 font-medium px-2 py-1 hover:bg-blue-100 rounded"
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
                              {formData.window.target_monitor === m.name
                                ? 'Is Default'
                                : 'Set Default'}
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
                                default_x: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                                default_y: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hardware' && (
                <div className="space-y-4">
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
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                              polling_interval_ms: parseInt(e.target.value, 10) || 1000,
                            },
                          })
                        }
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Thresholds
                    </h3>
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
                                  nvidia_temp: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
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
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1 h-24 resize-none"
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
                                cooldown_seconds: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                                boredom_threshold_cpu: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sound' && (
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
                            sound: { ...formData.sound, volume: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'sprite' && (
                <div className="flex justify-center h-full">
                  <AnimationPreview />
                </div>
              )}

              {activeTab === 'hotkeys' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Toggle Click-through
                      <input
                        type="text"
                        value={formData.hotkeys.toggle_click_through}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotkeys: { ...formData.hotkeys, toggle_click_through: e.target.value },
                          })
                        }
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
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
                        className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        placeholder="Ctrl+Shift+Q"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Note: Use standard accelerator format (e.g., Ctrl+Shift+Alt+K).
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
