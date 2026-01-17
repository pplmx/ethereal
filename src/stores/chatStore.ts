import { create } from 'zustand';

interface ChatState {
  message: string | null;
  isThinking: boolean;
  isVisible: boolean;

  setMessage: (msg: string | null) => void;
  setThinking: (thinking: boolean) => void;
  setVisible: (visible: boolean) => void;
  showResponse: (msg: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  message: null,
  isThinking: false,
  isVisible: false,

  setMessage: (message) => set({ message }),
  setThinking: (isThinking) => set({ isThinking }),
  setVisible: (isVisible) => set({ isVisible }),

  showResponse: (message) => {
    set({ message, isThinking: false, isVisible: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      set({ isVisible: false });
    }, 5000);
  },
}));
