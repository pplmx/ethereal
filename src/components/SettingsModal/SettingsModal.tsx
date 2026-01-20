import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMonitorStore } from '../../stores/monitorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { AppConfig } from '../../types/config';

import { AITab } from './AITab';
import { HardwareTab } from './HardwareTab';
import { HotkeysTab } from './HotkeysTab';
import { NotificationsTab } from './NotificationsTab';
import { PrivacyTab } from './PrivacyTab';
import { SleepTab } from './SleepTab';
import { SoundTab } from './SoundTab';
import { SpriteTab } from './SpriteTab';
import { WindowTab } from './WindowTab';

type TabType =
  | 'window'
  | 'hardware'
  | 'ai'
  | 'sound'
  | 'sprite'
  | 'hotkeys'
  | 'notifications'
  | 'sleep'
  | 'privacy';

export const SettingsModal = () => {
  const { isOpen, setIsOpen, config, updateConfig, loadConfig } = useSettingsStore();
  const { fetchMonitors } = useMonitorStore();
  const [formData, setFormData] = useState<AppConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('window');

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

  const renderTabContent = () => {
    const props = { formData, setFormData };
    switch (activeTab) {
      case 'window':
        return <WindowTab {...props} />;
      case 'hardware':
        return <HardwareTab {...props} />;
      case 'ai':
        return <AITab {...props} />;
      case 'sound':
        return <SoundTab {...props} />;
      case 'sprite':
        return <SpriteTab />;
      case 'hotkeys':
        return <HotkeysTab {...props} />;
      case 'notifications':
        return <NotificationsTab {...props} />;
      case 'sleep':
        return <SleepTab {...props} />;
      case 'privacy':
        return <PrivacyTab {...props} />;
      default:
        return null;
    }
  };

  const tabs: TabType[] = [
    'window',
    'hardware',
    'ai',
    'sound',
    'sprite',
    'hotkeys',
    'notifications',
    'sleep',
    'privacy',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleCancel}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-premium neon-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 text-white flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-[0_0_12px_rgba(129,140,248,0.8)]"
                />
                <h2 className="text-xs font-bold tracking-[0.25em] uppercase bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">
                  Spirit Configuration
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all text-lg"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide bg-black/30 px-2 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all relative rounded-t-lg ${
                    activeTab === tab
                      ? 'text-white bg-white/5'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto flex-1 text-white bg-gradient-to-b from-transparent to-black/20 custom-scrollbar">
              {/* Mesh gradient background */}
              <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {renderTabContent()}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/50 flex justify-end space-x-4 items-center">
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all border border-white/10"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white rounded-full btn-premium"
              >
                <span className="relative z-10">Sync Configuration</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
