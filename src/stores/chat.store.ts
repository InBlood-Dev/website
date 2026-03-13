import { create } from "zustand";
import type { FirebaseMessage } from "@/lib/firebase/messaging";

interface ChatState {
  conversations: Map<string, FirebaseMessage[]>;
  activeConversationId: string | null;
  typingStates: Map<string, boolean>;
  unsubscribers: Map<string, () => void>;
}

interface ChatActions {
  setMessages: (conversationId: string, messages: FirebaseMessage[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addUnsubscriber: (key: string, unsub: () => void) => void;
  removeUnsubscriber: (key: string) => void;
  cleanup: () => void;
}

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  conversations: new Map(),
  activeConversationId: null,
  typingStates: new Map(),
  unsubscribers: new Map(),

  setMessages: (conversationId, messages) => {
    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.set(conversationId, messages);
      return { conversations: newConversations };
    });
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
  },

  setTyping: (conversationId, isTyping) => {
    set((state) => {
      const newTyping = new Map(state.typingStates);
      newTyping.set(conversationId, isTyping);
      return { typingStates: newTyping };
    });
  },

  addUnsubscriber: (key, unsub) => {
    const { unsubscribers } = get();
    // Clean up existing if overwriting
    const existing = unsubscribers.get(key);
    if (existing) existing();
    set((state) => {
      const newUnsubs = new Map(state.unsubscribers);
      newUnsubs.set(key, unsub);
      return { unsubscribers: newUnsubs };
    });
  },

  removeUnsubscriber: (key) => {
    const { unsubscribers } = get();
    const unsub = unsubscribers.get(key);
    if (unsub) unsub();
    set((state) => {
      const newUnsubs = new Map(state.unsubscribers);
      newUnsubs.delete(key);
      return { unsubscribers: newUnsubs };
    });
  },

  cleanup: () => {
    const { unsubscribers } = get();
    unsubscribers.forEach((unsub) => unsub());
    set({
      conversations: new Map(),
      activeConversationId: null,
      typingStates: new Map(),
      unsubscribers: new Map(),
    });
  },
}));
