import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';

interface HotkeyRecorderProps {
  value: string;
  onChange: (hotkey: string) => void;
  className?: string;
  placeholder?: string;
}

// Detect modifier keys on mac vs windows if needed, but for now standardizing on Ctrl
// keys map for display
const formatKey = (key: string) => {
  if (key === 'Control') return 'Ctrl';
  if (key === ' ') return 'Space';
  if (key.length === 1) return key.toUpperCase();
  return key;
};

export const HotkeyRecorder = ({
  value,
  onChange,
  className,
  placeholder = 'Click to record...',
}: HotkeyRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentKeys, setCurrentKeys] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newKeys = new Set(currentKeys);

      // Reset if no modifiers and normal key pressed previously (simple heuristic)
      if (newKeys.size > 0 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        // If typing a single letter without modifiers, maybe reset?
        // But usually we want Mod+Key.
        // For now, let's just add to set.
      }

      newKeys.add(e.key);
      setCurrentKeys(newKeys);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // When all modifiers generally lifted, we might consider recording "done"
      // But simpler is to check valid combination on every key up

      // Construct hotkey string
      const modifiers: string[] = [];
      if (currentKeys.has('Control')) modifiers.push('Ctrl');
      if (currentKeys.has('Alt')) modifiers.push('Alt');
      if (currentKeys.has('Shift')) modifiers.push('Shift');
      if (currentKeys.has('Meta')) modifiers.push('Super');

      const nonModifiers = Array.from(currentKeys).filter(
        (k) => !['Control', 'Alt', 'Shift', 'Meta'].includes(k),
      );

      // If we have at least one modifier and one key, or strict requirements
      if (modifiers.length > 0 && nonModifiers.length > 0) {
        // Find the "main" key (last pressed usually, or just the char)
        const mainKey = nonModifiers[nonModifiers.length - 1]; // Naive pick

        if (mainKey) {
          // Final string
          const hotkeyString = [...modifiers, formatKey(mainKey)].join('+');
          onChange(hotkeyString);
          setIsRecording(false);
          setCurrentKeys(new Set());
        }
      } else if (nonModifiers.length === 1 && modifiers.length === 0) {
        // Allow F-keys single press
        const key = nonModifiers[0];
        if (key?.startsWith('F') && key.length > 1) {
          onChange(key);
          setIsRecording(false);
          setCurrentKeys(new Set());
        }
      }

      // Cleanup released keys from set if we are still recording?
      // Actually standard recorders often capture the "chord" at the moment of completion.
      // Let's rely on the logic above: if we have a valid combo, save and stop.
      // If user releases keys without valid combo, remove them.
      const newKeys = new Set(currentKeys);
      newKeys.delete(e.key);
      setCurrentKeys(newKeys);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Lose focus -> stop recording
    const handleBlur = () => {
      setIsRecording(false);
      setCurrentKeys(new Set());
    };
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isRecording, currentKeys, onChange]);

  // Display text
  const getDisplayText = () => {
    if (isRecording) {
      if (currentKeys.size === 0) return 'Press keys...';
      const keys = Array.from(currentKeys).map(formatKey);
      // Sort nicely: Modifiers first
      const mods = keys.filter((k) => ['Ctrl', 'Alt', 'Shift', 'Super', 'Meta'].includes(k));
      const others = keys.filter((k) => !['Ctrl', 'Alt', 'Shift', 'Super', 'Meta'].includes(k));
      return [...mods, ...others].join(' + ');
    }
    return value || placeholder;
  };

  return (
    <button
      type="button"
      onClick={() => {
        setIsRecording(true);
        setCurrentKeys(new Set());
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsRecording(true);
          setCurrentKeys(new Set());
        }
      }}
      className={cn(
        'w-full rounded-xl p-3 text-sm border transition-all cursor-pointer flex items-center justify-between select-none outline-none focus:ring-2 focus:ring-indigo-500/50',
        isRecording
          ? 'bg-indigo-500/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
          : 'bg-white/5 border-white/10 text-white hover:border-white/20',
        className,
      )}
    >
      <span className={cn('font-mono', !value && !isRecording && 'text-white/30 italic font-sans')}>
        {getDisplayText()}
      </span>

      {isRecording && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}

      {!isRecording && value && (
        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 uppercase tracking-wider">
          Record
        </span>
      )}
    </button>
  );
};
