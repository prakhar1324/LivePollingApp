import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  results: [],
  totalVotes: 0,
  timeRemaining: 0,
  isActive: false,
  userAnswer: null,
  hasAnswered: false,
  pollHistory: [],
  loading: false,
  error: null,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.isActive = true;
      state.hasAnswered = false;
      state.userAnswer = null;
      
      if (state.results.length === 0 || state.results.length !== action.payload.options.length) {
        state.results = new Array(action.payload.options.length).fill(0);
        state.totalVotes = 0;
      }
      
      if (action.payload.timeRemaining !== undefined) {
        state.timeRemaining = action.payload.timeRemaining;
      } else if (action.payload.duration && action.payload.startTime) {
        const elapsed = Date.now() - action.payload.startTime;
        state.timeRemaining = Math.max(0, action.payload.duration - elapsed);
      } else if (action.payload.duration) {
        state.timeRemaining = action.payload.duration;
      }
    },
    createPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.isActive = true;
      state.hasAnswered = false;
      state.userAnswer = null;
      state.results = new Array(action.payload.options.length).fill(0);
      state.totalVotes = 0;
      
      if (action.payload.duration && action.payload.startTime) {
        const elapsed = Date.now() - action.payload.startTime;
        state.timeRemaining = Math.max(0, action.payload.duration - elapsed);
      } else if (action.payload.duration) {
        state.timeRemaining = action.payload.duration;
      }
    },
    updateResults: (state, action) => {
      state.results = action.payload.results;
      state.totalVotes = action.payload.totalVotes;
    },
    setUserAnswer: (state, action) => {
      state.userAnswer = action.payload;
      state.hasAnswered = true;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    endPoll: (state) => {
      state.isActive = false;
      state.timeRemaining = 0;
    },
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload;
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
    resetPoll: (state) => {
      state.currentPoll = null;
      state.results = [];
      state.totalVotes = 0;
      state.timeRemaining = 0;
      state.isActive = false;
      state.userAnswer = null;
      state.hasAnswered = false;
    },
  },
});

export const {
  setPoll,
  createPoll,
  updateResults,
  setUserAnswer,
  setTimeRemaining,
  endPoll,
  setPollHistory,
  setLoading,
  setError,
  clearError,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer;
