import { create } from 'zustand';
import { getConversations, getMessages, sendMessage, createConversation } from '../api/conversations';

const useMessagingStore = create((set, get) => ({
  conversations: [],
  currentMessages: [],
  currentConversation: null,
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const conversations = await getConversations();
      set({ conversations, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load conversations', loading: false });
    }
  },

  fetchMessages: async (conversationId, params) => {
    set({ loading: true, error: null });
    try {
      const data = await getMessages(conversationId, params);
      set({ currentMessages: data.messages, currentConversation: conversationId, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load messages', loading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const message = await sendMessage(conversationId, content);
      set((state) => ({
        currentMessages: [...state.currentMessages, message],
      }));
      return message;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to send message' });
      throw error;
    }
  },

  startConversation: async (userId) => {
    set({ loading: true, error: null });
    try {
      const conversation = await createConversation(userId);
      set({ loading: false });
      return conversation;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create conversation', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useMessagingStore;
