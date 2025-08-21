import { create } from "zustand";

export const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => {
    console.log("🎯 [Store] Setting selected conversation:", selectedConversation);
    set({ selectedConversation });
  },
  
  messages: [],
  setMessages: (messages) => {
    console.log("📝 [Store] Setting messages:", messages?.length || 0, "messages");
    set({ messages: Array.isArray(messages) ? messages : [] });
  },
  
  // Add a new message to the current messages array
  addMessage: (newMessage) => {
    console.log("➕ [Store] Adding new message:", newMessage);
    set((state) => {
      // Check if message already exists
      const exists = state.messages.some(msg => msg._id === newMessage._id);
      if (exists) {
        console.log("🔄 [Store] Message already exists, skipping");
        return state;
      }
      
      const updatedMessages = [...state.messages, newMessage];
      console.log("✅ [Store] Messages after adding:", updatedMessages.length);
      return {
        messages: updatedMessages
      };
    });
  },
  
  // Mark message as deleted (don't remove, just mark)
  markMessageDeleted: (messageId) => {
    console.log("🗑️ [Store] Marking message as deleted:", messageId);
    set((state) => {
      const updatedMessages = state.messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, isDeleted: true, message: "This message was deleted" }
          : msg
      );
      console.log("✅ [Store] Messages after marking deleted:", updatedMessages.length);
      return {
        messages: updatedMessages
      };
    });
  },
  
  // Remove a message completely (for hard delete)
  removeMessage: (messageId) => {
    console.log("🗑️ [Store] Removing message completely:", messageId);
    set((state) => {
      const updatedMessages = state.messages.filter(msg => msg._id !== messageId);
      console.log("✅ [Store] Messages after removal:", updatedMessages.length);
      return {
        messages: updatedMessages
      };
    });
  },
  
  // Clear all messages
  clearMessages: () => {
    console.log("🧹 [Store] Clearing all messages");
    set({ messages: [] });
  },
  
  // Get current state (useful for debugging)
  getCurrentState: () => {
    return get();
  },
  
  isMobileView: false,
  setIsMobileView: (isMobileView) => set({ isMobileView }),
}));