const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import socket configuration
const configureSocket = require('./socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const droneRoutes = require('./routes/droneRoutes');
const missionRoutes = require('./routes/missionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// Connect to MongoDB using the URI from the .env file
mongoose.set('strictPopulate', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


// Setup Socket.io
configureSocket(io);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*wildcard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Global error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

module.exports = { app, server, io };