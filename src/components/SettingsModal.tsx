import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { AppConfig } from '../types/config';

export const SettingsModal = () => {
  const { isOpen, setIsOpen, config, updateConfig, loadConfig } = useSettingsStore();
  const [formData, setFormData] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'window' | 'hardware' | 'ai' | 'sound'>('window');

  useEffect(() => {
    if (isOpen && !config) {
      loadConfig();
    }
  }, [isOpen, config, loadConfig]);

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
    if (config) setFormData(config);
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

            <div className="flex border-b">
              {(['window', 'hardware', 'ai', 'sound'] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium capitalize ${
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
                      Cooldown (seconds)
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
