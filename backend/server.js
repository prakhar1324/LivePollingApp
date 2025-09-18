const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');


require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://leafy-souffle-1035b1.netlify.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
};

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.get('/', (req, res) => {
  res.send('Server is running successfully !! ');
});

app.use(cors(corsOptions));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Enhance initial Mongo connect logs
console.log('Initializing Mongo connection...');

// Socket.IO connection error logging
io.engine.on('connection_error', (err) => {
  console.error('[Socket.IO] connection_error', {
    code: err.code,
    message: err.message,
    context: err.context,
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.conn.on('packetCreate', (packet) => {
    if (packet.type === 'ping' || packet.type === 'pong') return;
    // console.log(`[Socket.IO] packetCreate:`, packet.type);
  });

  socket.on('error', (e) => {
    console.error(`[Socket.IO] socket error: ${socket.id}`, e);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} — reason: ${reason}`);
  });
});


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prakhar:shivi%4021@pollingdb.kn5qavp.mongodb.net/polling-app?retryWrites=true&w=majority&appName=pollingDB';
let isMongoConnected = false;

// Enhance initial Mongo connect with higher timeouts
mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 60000,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    isMongoConnected = true;
  })
  .catch(err => {
    console.log('MongoDB connection error (continuing without DB):', err.message);
    isMongoConnected = false;
  });


const pollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  results: [Number],
  totalVotes: Number,
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);


let currentPoll = {
  question: "",
  options: [],
  answers: {},
  startTime: null,
  duration: 60000,
  isActive: false,
  timer: null
};

const connectedUsers = new Map();

const chatMessages = [];
 
async function initializeDatabase() {
  if (isMongoConnected) {
    try {
      const totalPolls = await Poll.countDocuments();
      console.log(`Database initialized with ${totalPolls} existing polls`);
    } catch (error) {
      console.error('Error checking database:', error);
    }
  } else {
    console.log('MongoDB not connected - poll history will be empty until connection is established');
  }
}

setTimeout(initializeDatabase, 2000);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const { name, role, studentId } = data;
    console.log('=== USER JOINING ===');
    console.log('Join data received:', { name, role, studentId });
    console.log('Socket ID:', socket.id);
    
    connectedUsers.set(socket.id, { name, role, studentId: studentId || uuidv4() });
    
    if (currentPoll.isActive) {
      const userAnswer = currentPoll.answers[connectedUsers.get(socket.id).studentId];
      socket.emit('poll_update', {
        question: currentPoll.question,
        options: currentPoll.options,
        results: calculateResults(),
        timeRemaining: Math.max(0, currentPoll.duration - (Date.now() - currentPoll.startTime)),
        userAnswer: userAnswer !== undefined ? userAnswer : null,
        hasAnswered: userAnswer !== undefined
      });
    } else if (currentPoll.question && currentPoll.options.length > 0) {
      socket.emit('poll_results', {
        results: calculateResults(),
        totalVotes: Object.keys(currentPoll.answers).length
      });
    }
    
    if (chatMessages.length > 0) {
      console.log(`Sending ${chatMessages.length} chat messages to new user`);
      socket.emit('chat_history', chatMessages);
    }
    
    const usersList = Array.from(connectedUsers.values());
    console.log('Broadcasting users_list to all clients:', usersList);
    console.log('Total connected users:', usersList.length);
    console.log('Students:', usersList.filter(u => u.role === 'student').length);
    console.log('Teachers:', usersList.filter(u => u.role === 'teacher').length);
    io.emit('users_list', usersList);
    
    console.log(`User ${name} joined as ${role}`);
  });

  socket.on('create_poll', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'teacher') {
      socket.emit('error', 'Only teachers can create polls');
      return;
    }

    if (currentPoll.isActive) {
      socket.emit('error', 'A poll is already active');
      return;
    }

    const { question, options, duration = 60000 } = data;
    
    currentPoll = {
      question,
      options,
      answers: {},
      startTime: Date.now(),
      duration,
      isActive: true,
      timer: null
    };

    currentPoll.timer = setTimeout(() => {
      console.log('=== TIMER EXPIRED ===');
      console.log('Poll question:', currentPoll.question);
      console.log('Poll answers:', currentPoll.answers);
      endPoll();
    }, duration);

    io.emit('poll_created', {
      question: currentPoll.question,
      options: currentPoll.options,
      duration: currentPoll.duration,
      startTime: currentPoll.startTime
    });

    console.log('Poll created:', question);
  });

  socket.on('submit_answer', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'student') {
      socket.emit('error', 'Only students can submit answers');
      return;
    }

    if (!currentPoll.isActive) {
      socket.emit('error', 'No active poll');
      return;
    }

    const { optionIndex } = data;
    
    if (currentPoll.answers[user.studentId]) {
      socket.emit('error', 'You have already answered this poll');
      return;
    }

    currentPoll.answers[user.studentId] = optionIndex;

    const results = calculateResults();
    const totalVotes = Object.keys(currentPoll.answers).length;
    
    console.log(`Student ${user.name} answered: ${optionIndex}`);
    console.log('Current answers:', currentPoll.answers);
    console.log('Calculated results:', results);
    console.log('Total votes:', totalVotes);
    
    io.emit('poll_results', {
      results,
      totalVotes
    });
  });

  socket.on('chat_message', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      user: user.name,
      message: data.message,
      timestamp: Date.now(),
      role: user.role
    };

    chatMessages.push(message);
    console.log(`Chat message stored. Total messages: ${chatMessages.length}`);

    io.emit('chat_message', message);
  });

  socket.on('remove_student', (data) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'teacher') {
      socket.emit('error', 'Only teachers can remove students');
      return;
    }

    const { studentId } = data;
    
    for (const [socketId, userData] of connectedUsers.entries()) {
      if (userData.studentId === studentId && userData.role === 'student') {
        io.to(socketId).emit('kicked_out');
        connectedUsers.delete(socketId);
        io.sockets.sockets.get(socketId)?.disconnect();
        break;
      }
    }

    io.emit('users_list', Array.from(connectedUsers.values()));
  });

  socket.on('get_poll_history', async () => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'teacher') {
      socket.emit('error', 'Only teachers can view poll history');
      return;
    }

    if (!isMongoConnected) {
      console.log('MongoDB not connected, returning empty poll history');
      socket.emit('poll_history', []);
      return;
    }

    try {
      const dbPolls = await Poll.find().sort({ createdAt: -1 });
      console.log('=== POLL HISTORY REQUEST ===');
      console.log(`Retrieved ${dbPolls.length} polls from database`);
      console.log('Poll questions:', dbPolls.map(p => p.question));
      console.log('Poll IDs:', dbPolls.map(p => p._id));
      
      socket.emit('poll_history', dbPolls);
    } catch (error) {
      console.error('Error fetching poll history from database:', error);
      console.error('Database error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      socket.emit('poll_history', []);
    }
  });

  socket.on('end_poll', () => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'teacher') {
      socket.emit('error', 'Only teachers can end polls');
      return;
    }

    if (currentPoll.isActive) {
      endPoll();
    }
  });

  socket.on('end_session', async () => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.role !== 'teacher') {
      socket.emit('error', 'Only teachers can end the session');
      return;
    }

    console.log('=== SESSION ENDING ===');
    console.log('Current poll active:', currentPoll.isActive);
    console.log('Current poll question:', currentPoll.question);
    console.log('Current poll answers:', currentPoll.answers);
    console.log('MongoDB connected:', isMongoConnected);
    
    if (currentPoll.isActive && currentPoll.question) {
      console.log('Ending active poll...');
      await endPoll();
    } else if (currentPoll.question && Object.keys(currentPoll.answers).length > 0) {
      console.log('Saving poll with votes during session end...');
      const results = calculateResults();
      const totalVotes = Object.keys(currentPoll.answers).length;
      
      if (isMongoConnected) {
        try {
          const poll = new Poll({
            question: currentPoll.question,
            options: currentPoll.options,
            results,
            totalVotes
          });
          const savedPoll = await poll.save();
          console.log('Poll saved to database during session end:', {
            id: savedPoll._id,
            question: currentPoll.question,
            totalVotes,
            createdAt: savedPoll.createdAt
          });
        } catch (error) {
          console.error('Error saving poll to database during session end:', error);
          console.error('Session end database error details:', {
            name: error.name,
            message: error.message,
            code: error.code
          });
        }
      } else {
        console.log('MongoDB not connected during session end, poll not saved');
      }
    } else {
      console.log('No poll to save - question:', currentPoll.question, 'answers:', Object.keys(currentPoll.answers).length);
    }

    const teacherSocketId = socket.id;
    for (const [socketId, userData] of connectedUsers.entries()) {
      if (socketId !== teacherSocketId && userData.role === 'student') {
        io.to(socketId).emit('session_ended');
        connectedUsers.delete(socketId);
        io.sockets.sockets.get(socketId)?.disconnect();
      }
    }

    chatMessages.length = 0;
    console.log('Chat messages cleared for new session');

    currentPoll.isActive = false;
    if (currentPoll.timer) {
      clearTimeout(currentPoll.timer);
      currentPoll.timer = null;
    }

    socket.emit('session_ended_success');
    
    console.log('Session ended by teacher');
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`User ${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      
      io.emit('users_list', Array.from(connectedUsers.values()));
    }
  });
});

function calculateResults() {
  const results = new Array(currentPoll.options.length).fill(0);
  
  Object.values(currentPoll.answers).forEach(optionIndex => {
    if (optionIndex >= 0 && optionIndex < results.length) {
      results[optionIndex]++;
    }
  });
  
  return results;
}

async function endPoll() {
  if (!currentPoll.isActive) return;
  
  currentPoll.isActive = false;
  const results = calculateResults();
  const totalVotes = Object.keys(currentPoll.answers).length;
  
  console.log('=== POLL ENDING ===');
  console.log('Poll ending - Question:', currentPoll.question);
  console.log('Poll ending - Options:', currentPoll.options);
  console.log('Poll ending - Final results:', results);
  console.log('Poll ending - Total votes:', totalVotes);
  console.log('Poll ending - Answers:', currentPoll.answers);
  console.log('MongoDB connected:', isMongoConnected);
  
  if (currentPoll.question && isMongoConnected) {
    try {
      const poll = new Poll({
        question: currentPoll.question,
        options: currentPoll.options,
        results,
        totalVotes
      });
      const savedPoll = await poll.save();
      console.log('Poll saved to database:', { 
        id: savedPoll._id,
        question: currentPoll.question, 
        totalVotes,
        createdAt: savedPoll.createdAt
      });
    } catch (error) {
      console.error('Error saving poll to database:', error);
      console.error('Database error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
    }
  } else if (currentPoll.question && !isMongoConnected) {
    console.log('MongoDB not connected, poll not saved');
  }
  
  io.emit('poll_ended', {
    results,
    totalVotes,
    correctAnswer: null
  });
  
  console.log('Poll ended');
}

// Lazy Mongo connection helper to recover after cold starts
async function ensureMongoConnection() {
  try {
    console.log(`[Mongo] readyState=${mongoose.connection.readyState}`);
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      console.log('[Mongo] Already connected');
      return true;
    }
    if (mongoose.connection.readyState === 2) {
      console.log('[Mongo] Currently connecting...');
      return true;
    }

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Mongo] Attempting reconnection (attempt ${attempt}/${maxAttempts})...`);
        await mongoose.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 20000,
          socketTimeoutMS: 60000,
        });
        isMongoConnected = true;
        console.log('[Mongo] Reconnected successfully');
        return true;
      } catch (innerErr) {
        console.log(`[Mongo] Reconnect attempt ${attempt} failed:`, innerErr.message);
        if (attempt === maxAttempts) throw innerErr;
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    return false;
  } catch (err) {
    console.log('[Mongo] ensureMongoConnection failed:', err.message, 'name:', err.name, 'code:', err.code);
    isMongoConnected = false;
    return false;
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/poll-history', async (req, res) => {
  console.log('API: Getting poll history from database only');

  const ok = await ensureMongoConnection();
  if (!ok) {
    return res.json({ 
      polls: [],
      count: 0,
      mongoConnected: false,
      error: 'MongoDB not connected'
    });
  }

  try {
    const dbPolls = await Poll.find().sort({ createdAt: -1 });
    console.log(`API: Retrieved ${dbPolls.length} polls from database`);
    console.log('API: Poll questions:', dbPolls.map(p => p.question));
    
    res.json({ 
      polls: dbPolls,
      count: dbPolls.length,
      mongoConnected: true,
      source: 'database'
    });
  } catch (error) {
    console.error('API: Error fetching from database:', error);
    res.json({ 
      polls: [],
      count: 0,
      mongoConnected: true,
      error: error.message
    });
  }
});

app.get('/api/test-db', async (req, res) => {
  console.log('API: Testing database connection and operations');

  const ok = await ensureMongoConnection();
  const testResult = {
    mongoConnected: ok,
    connectionString: MONGODB_URI.replace(/:[^@]+@/, ':****@'),
    tests: {}
  };
  if (!ok) {
    testResult.error = 'MongoDB not connected';
    return res.json(testResult);
  }

  try {
    const totalPolls = await Poll.countDocuments();
    testResult.tests.totalPolls = totalPolls;

    const testPolls = await Poll.find({ question: { $regex: /^Test Poll/ } });
    testResult.tests.testPolls = testPolls.length;

    const recentPolls = await Poll.find().sort({ createdAt: -1 }).limit(5);
    testResult.tests.recentPolls = recentPolls.map(p => ({
      question: p.question,
      totalVotes: p.totalVotes,
      createdAt: p.createdAt
    }));

    const testPoll = new Poll({
      question: 'DB Test Poll - DELETE ME',
      options: ['Test'],
      results: [1],
      totalVotes: 1
    });
    await testPoll.save();
    await Poll.findByIdAndDelete(testPoll._id);
    testResult.tests.writeTest = 'SUCCESS';
  } catch (error) {
    console.error('API: Database test error:', error);
    testResult.tests.error = error.message;
  }

  res.json(testResult);
});

app.get('/api/poll/current', (req, res) => {
  if (!currentPoll.isActive) {
    return res.json({ isActive: false });
  }
  
  res.json({
    isActive: true,
    question: currentPoll.question,
    options: currentPoll.options,
    results: calculateResults(),
    timeRemaining: Math.max(0, currentPoll.duration - (Date.now() - currentPoll.startTime))
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using MongoDB as the only data source for poll history');
});
