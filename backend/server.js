const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/index');
const { errorHandler } = require('./middleware/error.middleware');
const { initializeSentry, getSentryInstance, isSentryEnabled } = require('./config/sentry');

// Initialize Sentry early
initializeSentry();
const Sentry = getSentryInstance();

const app = express();
const PORT = process.env.PORT || 3003;

// Add Sentry request handler as the first middleware (only if enabled)
if (isSentryEnabled()) {
    app.use(Sentry.Handlers.requestHandler());
}

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3003', 
    'http://127.0.0.1:5173', 
    'http://localhost:5173', 
    'https://navodhya-fernando.github.io' // Added the live GitHub Pages domain
  ],
  credentials: true
}));

// Session middleware for OTP storage
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const authRoutes = require('./routes/auth.route');
const questionRoutes = require('./routes/question.route');
const leaderboardRoutes = require('./routes/leaderboard.route');

// Connect to Database
connectDB();

app.get('/', (req, res) => {
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

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 The Online Kuppiya server running on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}`);
    console.log(`📚 Ready to serve Sri Lankan university students!`);
}).on('error', (err) => {
    console.error('❌ Server failed to start:', err);
});