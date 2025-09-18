import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isOpen: false,
  activeTab: 'chat', 
  participants: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      
      const messageExists = state.messages.some(msg => msg.id === action.payload.id);
      if (!messageExists) {
        state.messages.push(action.payload);
      }
    },
    setMessages: (state, action) => {
      
      const messageMap = new Map();
      
      
      state.messages.forEach(msg => {
        if (msg.id) {
          messageMap.set(msg.id, msg);
        }
      });
      
      
      action.payload.forEach(msg => {
        if (msg.id) {
          messageMap.set(msg.id, msg);
        }
      });
      
      
      state.messages = Array.from(messageMap.values()).sort((a, b) => 
        (a.timestamp || 0) - (b.timestamp || 0)
      );
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    setChatOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  setMessages,
  toggleChat,
  setChatOpen,
  setActiveTab,
  setParticipants,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
