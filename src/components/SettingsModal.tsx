import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMonitorStore } from '../stores/monitorStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSpriteStore } from '../stores/spriteStore';
import type { AppConfig } from '../types/config';
import { AnimationPreview } from './AnimationPreview';

export const SettingsModal = () => {
  const { isOpen, setIsOpen, config, updateConfig, loadConfig } = useSettingsStore();
  const { monitors, fetchMonitors, moveToMonitor } = useMonitorStore();
  const { hardware } = useSpriteStore();
  const [formData, setFormData] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'window'
    | 'hardware'
    | 'ai'
    | 'sound'
    | 'sprite'
    | 'hotkeys'
    | 'notifications'
    | 'sleep'
    | 'privacy'
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-effect rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 text-white flex flex-col max-h-[85vh]"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">Ethereal Intelligence</h2>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide bg-black/20 px-4">
              {(
                [
                  'window',
                  'hardware',
                  'ai',
                  'sound',
                  'sprite',
                  'hotkeys',
                  'notifications',
                  'sleep',
                  'privacy',
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-3 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all relative ${activeTab === tab
                    ? 'text-indigo-400'
                    : 'text-white/30 hover:text-white/60'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-white bg-black/10 custom-scrollbar">
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
                              className={`text-xs font-medium px-2 py-1 rounded ${formData.window.target_monitor === m.name
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
                                default_y: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hardware' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Current Status
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] font-mono mt-1">CPU Usage</span>
                        <span className="text-sm font-medium">
                          {hardware?.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] font-mono mt-1">Temperature</span>
                        <span className="text-sm font-medium">
                          {hardware?.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] font-mono mt-1">Memory</span>
                        <span className="text-sm font-medium">
                          {hardware?.memory_used} / {hardware?.memory_total} MB
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[10px] font-mono mt-1">Network</span>
                        <span className="text-sm font-medium">
                          ↓ {hardware?.network_rx.toFixed(1)} KB/s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
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
                                    nvidia_temp: parseFloat(e.target.value) || 0,
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
                                cooldown_seconds: parseInt(e.target.value, 10) || 0,
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
                                boredom_threshold_cpu: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
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
                <div className="flex justify-center h-full text-slate-800">
                  <AnimationPreview />
                </div>
              )}

              {activeTab === 'hotkeys' && (
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

                  <div className="space-y-4 pt-4 border-t">
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
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
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

                  <p className="text-white/40 text-[10px] font-mono mt-1 mt-4">
                    Note: Use standard accelerator format for hotkeys (e.g., Ctrl+Shift+Alt+K).
                  </p>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      Enable System Notifications
                      <input
                        type="checkbox"
                        checked={formData.notifications.enabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notifications: { ...formData.notifications, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications.notify_on_overheating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              notify_on_overheating: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Notify on System Overheating
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifications.notify_on_angry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              notify_on_angry: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Notify when Ethereal is Angry
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.battery.notify_on_low_battery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            battery: {
                              ...formData.battery,
                              notify_on_low_battery: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Notify on Low Battery
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'sleep' && (
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
                      <label className="block text-sm font-medium mb-1">
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
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                          className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium mb-1">
                      Low Battery Threshold (%)
                      <input
                        type="number"
                        value={formData.battery.low_battery_threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            battery: {
                              ...formData.battery,
                              low_battery_threshold: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-sm border focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
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
                  <p className="text-[11px] text-white/40 mt-3 leading-relaxed italic">
                    When enabled, the title of your currently active window will be sent to the AI
                    context. This helps the spirit provide more relevant responses based on what you
                    are doing.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10 bg-black/40 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 text-[11px] font-bold tracking-widest uppercase text-white rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all"
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
