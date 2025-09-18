import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './slices/pollSlice';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    user: userReducer,
    chat: chatReducer,
  },
});

