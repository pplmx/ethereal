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
            className="glass-effect rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 text-white flex flex-col max-h-[85vh] border border-white/10"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/90">
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
            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide bg-black/40 px-4 group">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all relative ${
                    activeTab === tab ? 'text-indigo-400' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto flex-1 text-white bg-black/20 custom-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-black/60 flex justify-end space-x-4 items-center">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all transform active:scale-95"
              >
                Sync Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
