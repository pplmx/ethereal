import { useState } from 'react';
import { type SpriteState, useSpriteStore } from '../stores/spriteStore';
import { SpriteAnimator } from './SpriteAnimator';

export const AnimationPreview = () => {
  const { spriteConfig } = useSpriteStore();
  const [previewState, setPreviewState] = useState<SpriteState>('idle');
  const [previewMood, setPreviewMood] = useState('happy');

  const moods = ['happy', 'excited', 'angry', 'sad', 'tired', 'bored', 'sleeping'];

  // Helper to generate frames for preview
  const getPreviewFrames = (state: SpriteState) => {
    const config = spriteConfig[state];
    const baseUrl = '/sprites';
    // Match the store logic
    const prefix = state;

    if (!config) return [];

    return Array.from({ length: config.frameCount }, (_, i) => `${baseUrl}/${prefix}-${i + 1}.svg`);
  };

  const config = spriteConfig[previewState];

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-slate-50">
      <div className="w-64 h-64 flex items-center justify-center bg-transparent rounded-lg relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        <SpriteAnimator
          frames={getPreviewFrames(previewState)}
          fps={config?.fps}
          loop={config?.loop}
          mood={previewMood}
          className="w-48 h-48 object-contain z-10"
        />
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="preview-state"
            className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider"
          >
            Action
          </label>
          <select
            id="preview-state"
            value={previewState}
            onChange={(e) => setPreviewState(e.target.value as SpriteState)}
            className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {Object.keys(spriteConfig).map((state) => (
              <option key={state} value={state}>
                {state.charAt(0).toUpperCase() + state.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="preview-mood"
            className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider"
          >
            Mood
          </label>
          <select
            id="preview-mood"
            value={previewMood}
            onChange={(e) => setPreviewMood(e.target.value)}
            className="w-full rounded border-slate-300 p-2 text-sm border focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className="font-mono text-slate-700">{config?.fps}</span>
        </div>
        <div className="flex justify-between">
          <span>Frames:</span>
          <span className="font-mono text-slate-700">{config?.frameCount}</span>
        </div>
      </div>
    </div>
  );
};
