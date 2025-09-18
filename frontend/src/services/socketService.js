import { io } from 'socket.io-client';
import { store } from '../store/store';
import {
  setPoll,
  createPoll,
  updateResults,
  setTimeRemaining,
  endPoll,
  setPollHistory,
  setError,
  setUserAnswer,
} from '../store/slices/pollSlice';
import {
  setConnectedUsers,
} from '../store/slices/userSlice';
import {
  addMessage,
  setParticipants,
  setMessages,
} from '../store/slices/chatSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    
    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      console.log('SocketService: Creating new socket connection');
      
      // Determine server URL safely
      const rawUrl = process.env.REACT_APP_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
      let serverUrl = rawUrl;
      try {
        // Normalize relative values to absolute based on current origin
        if (!/^https?:\/\//i.test(rawUrl) && typeof window !== 'undefined' && window.location?.origin) {
          serverUrl = new URL(rawUrl, window.location.origin).toString();
        }
      } catch (_) {}
      
      // Use polling only for Vercel backends (serverless doesn't support persistent websockets)
      let usePollingOnly = false;
      try {
        const host = new URL(serverUrl).host;
        usePollingOnly = /vercel\.app$/i.test(host);
      } catch (_) {
        usePollingOnly = /vercel\.app/i.test(serverUrl);
      }
      const transportsToUse = usePollingOnly ? ['polling'] : ['websocket', 'polling'];
      console.log('SocketService: Using server URL:', serverUrl, 'transports:', transportsToUse, 'upgrade:', usePollingOnly ? false : true);

      this.socket = io(serverUrl, {
        transports: transportsToUse,
        upgrade: usePollingOnly ? false : true,
        timeout: 20000,
        forceNew: true,
        withCredentials: true,
      });

      this.socket.on('connect_error', (err) => {
        console.error('SocketService: connect_error:', err?.message || err);
      });

      this.setupEventListeners();
      
      this.socket.on('connect', () => {
        console.log('SocketService: Connected to server with ID:', this.socket.id);
        this.isConnected = true;
      });
      
      this.socket.on('disconnect', () => {
        console.log('SocketService: Disconnected from server');
        this.isConnected = false;
      });
      
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to server:', error);
      
      if (error.message && error.message.includes('Receiving end does not exist')) {
        console.log('Ignoring Chrome extension error');
        return null;
      }
      throw error;
    }
  }

  setupEventListeners() {
    

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      store.dispatch(setError(error));
    });

    this.socket.on('poll_created', (pollData) => {
      console.log('Poll created event received:', pollData);
      store.dispatch(createPoll(pollData));
      
      if (pollData.duration && pollData.startTime) {
        const elapsed = Date.now() - pollData.startTime;
        const timeRemaining = Math.max(0, pollData.duration - elapsed);
        store.dispatch(setTimeRemaining(timeRemaining));
      }
    });

    this.socket.on('poll_update', (pollData) => {
      store.dispatch(setPoll(pollData));
      if (pollData.timeRemaining) {
        store.dispatch(setTimeRemaining(pollData.timeRemaining));
      }
      
      if (pollData.hasAnswered && pollData.userAnswer !== null && pollData.userAnswer !== undefined) {
        store.dispatch(setUserAnswer(pollData.userAnswer));
      }
    });

    this.socket.on('poll_results', (resultsData) => {
      console.log('Received poll results:', resultsData);
      store.dispatch(updateResults(resultsData));
    });

    this.socket.on('poll_ended', (resultsData) => {
      console.log('Poll ended with results:', resultsData);
      store.dispatch(updateResults(resultsData));
      store.dispatch(endPoll());
    });

    this.socket.on('users_list', (users) => {
      console.log('Users list updated - Total:', users.length, 'Students:', users.filter(u => u.role === 'student').length);
      store.dispatch(setConnectedUsers(users));
      store.dispatch(setParticipants(users));
    });

    this.socket.on('chat_message', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('chat_history', (messages) => {
      console.log(`Received chat history: ${messages.length} messages`);
      
      store.dispatch(setMessages(messages));
    });

    this.socket.on('kicked_out', () => {
      
      window.location.href = '/kicked-out';
    });

    this.socket.on('poll_history', (history) => {
      console.log('Received poll history:', history);
      console.log('Poll history length:', history.length);
      store.dispatch(setPollHistory(history));
    });

    this.socket.on('session_ended', () => {
      
      window.location.href = '/session-ended';
    });

    this.socket.on('session_ended_success', () => {
      
      
      console.log('Session ended successfully - keeping poll data for final results');
    });
  }

  join(name, role, studentId = null) {
    if (!this.socket) {
      this.connect();
    }
    console.log('Joining as:', role, 'Name:', name, 'Connected:', this.socket.connected);
    this.socket.emit('join', { name, role, studentId });
  }

  createPoll(pollData) {
    if (!this.socket) return;
    this.socket.emit('create_poll', pollData);
  }

  submitAnswer(optionIndex) {
    if (!this.socket) return;
    this.socket.emit('submit_answer', { optionIndex });
  }

  sendChatMessage(message) {
    if (!this.socket) return;
    this.socket.emit('chat_message', { message });
  }

  removeStudent(studentId) {
    if (!this.socket) return;
    this.socket.emit('remove_student', { studentId });
  }

  getPollHistory() {
    if (!this.socket) {
      console.log('Socket not connected, cannot get poll history');
      return;
    }
    console.log('Requesting poll history from server');
    this.socket.emit('get_poll_history');
  }

  endSession() {
    if (!this.socket) return;
    this.socket.emit('end_session');
  }

  endPoll() {
    if (!this.socket) return;
    this.socket.emit('end_poll');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

const socketService = new SocketService();
export default socketService;
