# Backend Setup Instructions

## Environment Variables

1. Create a `.env` file in the `backend` directory
2. Copy the contents from `env.example` and update the values:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://prakhar:shivi%4021@pollingdb.kn5qavp.mongodb.net/polling-app?retryWrites=true&w=majority&appName=pollingDB
NODE_ENV=development
```

## Important Notes

- The MongoDB URI is already configured for your Atlas cluster
- The password `shivi@21` is URL-encoded as `shivi%4021`
- The database name is `polling-app`

## Running the Server

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

## Troubleshooting

1. **MongoDB Connection Issues**: 
   - Check if your IP is whitelisted in MongoDB Atlas
   - Verify the connection string is correct
   - The app will work with in-memory storage if MongoDB fails

2. **Poll History Empty**:
   - Check MongoDB connection logs
   - Polls are saved to both database and in-memory storage
   - In-memory storage includes a test poll for verification

3. **Chrome Extension Errors**:
   - These are now suppressed globally
   - They don't affect app functionality


