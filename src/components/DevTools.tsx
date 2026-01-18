import { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSpriteStore } from '../stores/spriteStore';

export const DevTools = () => {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    eventCount: 0,
  });
  const { setIsOpen } = useSettingsStore();
  const { hardware } = useSpriteStore();

  useEffect(() => {
    if (import.meta.env.DEV) {
      let lastTime = performance.now();
      let frames = 0;

      const measureFPS = () => {
        frames++;
        const now = performance.now();
        if (now >= lastTime + 1000) {
          setStats((prev) => ({ ...prev, fps: frames }));
          frames = 0;
          lastTime = now;
        }
        requestAnimationFrame(measureFPS);
      };
      measureFPS();
    }
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-0 right-0 bg-black/80 text-white p-2 text-xs z-50 pointer-events-auto flex flex-col items-end gap-2 rounded-bl-lg font-mono">
      <div>FPS: {stats.fps}</div>
      <div>Memory: {(performance as any).memory?.usedJSHeapSize >> 20 || 0}MB</div>
      {hardware && (
        <>
          <div>CPU: {hardware.utilization.toFixed(1)}%</div>
          <div>Net ↓: {hardware.network_rx} KB/s</div>
          <div>Net ↑: {hardware.network_tx} KB/s</div>
          <div className="text-blue-400">State: {hardware.state}</div>
        </>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors font-sans mt-1"
      >
        Settings
      </button>
    </div>
  );
};
