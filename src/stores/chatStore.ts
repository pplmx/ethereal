import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  message: string | null;
  isThinking: boolean;
  isVisible: boolean;
  history: ChatMessage[];

  setMessage: (msg: string | null) => void;
  setThinking: (thinking: boolean) => void;
  setVisible: (visible: boolean) => void;
  showResponse: (msg: string) => void;
  addToHistory: (role: 'user' | 'assistant', content: string) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  message: null,
  isThinking: false,
  isVisible: false,
  history: [],

  setMessage: (message) => set({ message }),
  setThinking: (isThinking) => set({ isThinking }),
  setVisible: (isVisible) => set({ isVisible }),

  addToHistory: (role, content) =>
    set((state) => {
      const newHistory = [...state.history, { role, content }];
      return { history: newHistory.slice(-10) };
    }),

  clearHistory: () => set({ history: [] }),

  showResponse: (message) => {
    set((state) => {
      const newHistory = [...state.history, { role: 'assistant' as const, content: message }];
      return {
        message,
        isThinking: false,
        isVisible: true,
        history: newHistory.slice(-10),
      };
    });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      set({ isVisible: false });
    }, 5000);
  },
}));
