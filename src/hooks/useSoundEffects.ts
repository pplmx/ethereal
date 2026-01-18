import { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useSoundStore } from '../stores/soundStore';
import { useSpriteStore } from '../stores/spriteStore';

export const useSoundEffects = () => {
  const { state: spriteState } = useSpriteStore();
  const { isThinking } = useChatStore();
  const { playSound } = useSoundStore();
  const previousState = useRef(spriteState);
  const previousThinking = useRef(isThinking);

  useEffect(() => {
    // State transition sounds
    if (previousState.current !== spriteState) {
      if (spriteState === 'overheating') {
        playSound('/sounds/alert.mp3');
      } else if (spriteState === 'gaming') {
        playSound('/sounds/active.mp3');
      } else if (previousState.current === 'idle' && spriteState === 'working') {
        playSound('/sounds/focus.mp3');
      }

      previousState.current = spriteState;
    }

    // Thinking/Chat sounds
    if (previousThinking.current !== isThinking) {
      if (isThinking) {
        playSound('/sounds/thinking.mp3');
      } else {
        // Finished thinking (response ready)
        playSound('/sounds/notification.mp3');
      }
      previousThinking.current = isThinking;
    }
  }, [spriteState, isThinking, playSound]);
};
