import { useEffect, useState } from 'react';

export const DevTools = () => {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    eventCount: 0,
  });

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
    <div className="fixed top-0 right-0 bg-black/80 text-white p-2 text-xs z-50 pointer-events-none">
      <div>FPS: {stats.fps}</div>
      <div>Memory: {(performance as any).memory?.usedJSHeapSize >> 20 || 0}MB</div>
    </div>
  );
};
