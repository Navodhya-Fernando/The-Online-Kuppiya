const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { connectDB } = require('./config/index');
const { errorHandler } = require('./middleware/error.middleware');
const { initializeSentry, getSentryInstance, isSentryEnabled } = require('./config/sentry');

// Initialize Sentry early
initializeSentry();
const Sentry = getSentryInstance();

const app = express();
const port = process.env.PORT || 5000;

// Add Sentry request handler as the first middleware (only if enabled)
if (isSentryEnabled()) {
    app.use(Sentry.Handlers.requestHandler());
}

const resourceRoutes = require('./routes/resource.route'); 
const authRoutes = require('./routes/auth.route'); 
const questionRoutes = require('./routes/question.route');
const leaderboardRoutes = require('./routes/leaderboard.route');

connectDB(); 

// CORS configuration - Allow all origins for development
app.use(cors({
    origin: true,
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

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.get('/', (req, res) => {
    res.send('Server is running for The Online Kuppiya!');
});

app.use('/api/resources', resourceRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Add Sentry error handler before other error handlers (only if enabled)
if (isSentryEnabled()) {
    app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port: ${port}`);
    console.log(`Server accessible at: http://localhost:${port}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});