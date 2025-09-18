# Live Polling System

A full-stack real-time polling application built with React, Express.js, and Socket.io. This application allows teachers to create polls and students to participate in real-time voting with live results.

## Features

### Core Features
- **Real-time Polling**: Teachers create polls and students answer in real-time
- **Live Results**: Both teachers and students see live poll results as votes come in
- **Timer Support**: Configurable poll duration (30s, 60s, 90s, 120s)
- **Role-based Access**: Separate interfaces for teachers and students
- **Session Management**: Students can enter their names and maintain sessions

### Teacher Features
- Create polls with multiple choice questions
- View live polling results
- Manage poll timing
- View poll history (stored in MongoDB)
- Remove students from the session
- Real-time chat with students

### Student Features
- Enter name on first visit
- Answer poll questions
- View live results after answering
- Real-time chat with other participants
- Session persistence

### Bonus Features
- **Real-time Chat**: Pop-up chat system for interaction
- **Poll History**: Teachers can view past poll results
- **Student Management**: Teachers can remove students
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time communication
- **Custom CSS** with Figma design colors

### Backend
- **Express.js** server
- **Socket.io** for real-time communication
- **MongoDB** with Mongoose for poll history storage
- **UUID** for unique student identification
- **CORS** enabled for cross-origin requests

## Project Structure

```
live-polling-app/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # Socket service
│   │   └── App.js
│   └── package.json
├── backend/                 # Express backend
│   ├── server.js           # Main server file
│   ├── package.json
│   └── render.yaml         # Render deployment config
├── package.json            # Root package.json
├── vercel.json            # Vercel deployment config
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (for poll history storage)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-polling-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/polling-app
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Deployment

#### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the build command to `cd frontend && npm run build`
3. Set the output directory to `frontend/build`
4. Add environment variable: `REACT_APP_SERVER_URL=https://your-backend-url.herokuapp.com`

#### Backend (Render)
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend-url.vercel.app`
   - `MONGODB_URI=your-mongodb-connection-string`

## Usage

### For Teachers
1. Visit the application and select "I'm a Teacher"
2. Create polls with questions and multiple choice options
3. Set poll duration (30s to 120s)
4. View live results as students answer
5. Use chat to communicate with students
6. View poll history for past sessions
7. Remove students if needed

### For Students
1. Visit the application and select "I'm a Student"
2. Enter your name
3. Wait for teacher to create a poll
4. Answer poll questions within the time limit
5. View live results after answering
6. Use chat to communicate with others

## API Endpoints

### REST API
- `GET /api/health` - Health check
- `GET /api/poll/current` - Get current poll status

### Socket.io Events

#### Client to Server
- `join` - Join the session with name and role
- `create_poll` - Create a new poll (teacher only)
- `submit_answer` - Submit answer to current poll (student only)
- `chat_message` - Send chat message
- `remove_student` - Remove a student (teacher only)
- `get_poll_history` - Get poll history (teacher only)

#### Server to Client
- `poll_created` - New poll created
- `poll_update` - Poll state update
- `poll_results` - Updated poll results
- `poll_ended` - Poll has ended
- `users_list` - Updated list of connected users
- `chat_message` - New chat message
- `kicked_out` - Student has been removed
- `poll_history` - Poll history data
- `error` - Error message

## Color Palette

The application uses a carefully selected color palette matching the Figma design:

- **Primary Purple**: `#7765DA`
- **Primary Blue**: `#5767D0`
- **Accent Purple**: `#4F0DCE`
- **Light Gray**: `#F2F2F2`
- **Dark Gray**: `#373737`
- **Medium Gray**: `#6E6E6E`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.


