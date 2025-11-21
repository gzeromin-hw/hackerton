import { create } from "zustand";

interface ChatState {
  question: string | null;
  setQuestion: (q: string) => void;
  clearQuestion: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  question: null,
  setQuestion: (q) => set({ question: q }),
  clearQuestion: () => set({ question: null }),
}));

export default useChatStore;
