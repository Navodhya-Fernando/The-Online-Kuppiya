// navodhya-fernando/the-online-kuppiya/.../backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const loadEnv = require('./config/env');
const connectDB = require('./config/index');
const { errorHandler } = require('./middleware/error.middleware');
const { initializeSentry, getSentryInstance, isSentryEnabled } = require('./config/sentry');

loadEnv();

// Initialize Sentry early
initializeSentry();
const Sentry = getSentryInstance();

const app = express();
const PORT = process.env.PORT || 3003;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://127.0.0.1:5173',
  'http://localhost:5173'
];

const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOrigins = [...new Set([...allowedOrigins, ...configuredOrigins])];

// Add Sentry request handler as the first middleware (only if enabled)
if (isSentryEnabled()) {
    app.use(Sentry.Handlers.requestHandler());
}

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const frontendDir = path.join(__dirname, '..', 'public');

// Routes
const authRoutes = require('./routes/auth.route');
const questionRoutes = require('./routes/question.route');
const leaderboardRoutes = require('./routes/leaderboard.route');

// Connect to Database
if (process.env.MONGO_URI) {
  connectDB().catch((error) => {
    console.error('❌ Initial database connection failed:', error.message);
  });
}

app.get('/api', (req, res) => {
  res.json({ 
    message: 'The Online Kuppiya API is running!',
    version: '1.0.0',
    description: 'A Q&A forum platform for Sri Lankan university students',
    endpoints: {
      auth: '/api/auth',
      questions: '/api/questions',
      leaderboard: '/api/leaderboard'
    }
  });
});

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(express.static(frontendDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(frontendDir, 'index.html'));
});

// Add Sentry error handler before other error handlers (only if enabled)
if (isSentryEnabled()) {
    app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 The Online Kuppiya server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}`);
      console.log(`📚 Ready to serve Sri Lankan university students!`);
    }).on('error', (err) => {
      console.error('❌ Server failed to start:', err);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;