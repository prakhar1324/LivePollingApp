import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  role: null, // 'teacher' or 'student'
  studentId: null,
  isAuthenticated: false,
  connectedUsers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { name, role, studentId } = action.payload;
      state.name = name;
      state.role = role;
      state.studentId = studentId;
      state.isAuthenticated = true;
    },
    setConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.name = '';
      state.role = null;
      state.studentId = null;
      state.isAuthenticated = false;
      state.connectedUsers = [];
    },
  },
});

export const {
  setUser,
  setConnectedUsers,
  setLoading,
  setError,
  clearError,
  logout,
} = userSlice.actions;

export default userSlice.reducer;

