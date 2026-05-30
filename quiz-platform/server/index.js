const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB, waitForDbReady, resolveMongoUri } = require('./config/db');

const teacherRoutes = require('./routes/teacherRoutes');
const quizRoutes = require('./routes/quizRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const dbConnected = dbState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'OK' : 'DEGRADED',
    message: 'Quiz Platform API is running',
    dbConnected,
  });
});

// Fast-fail requests when DB is unavailable instead of hanging
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const isReady = await waitForDbReady();

    if (!isReady) {
      const hasMongoUri = Boolean(resolveMongoUri());
      const hint = hasMongoUri
        ? 'Verify MongoDB is running and reachable from this machine.'
        : 'Set MONGO_URI (or MONGODB_URI) in server/.env.';

      return res.status(503).json({
        success: false,
        message: `Database unavailable right now. ${hint}`,
      });
    }
  }

  next();
});

// Routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/results', resultRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(
      `Initial MongoDB connection failed. Server starting in degraded mode: ${error.message}`
    );
  }

  app.listen(PORT, () => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    console.log(`Server running on port ${PORT} (database: ${dbStatus})`);
  });
};

startServer();
