const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const session = require('express-session');
const path = require('path');
const { connectDB } = require('./config/index');
const { errorHandler } = require('./middleware/error.middleware');

let sentryEnabled = false;
try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://75f9d3854eaa5b7c66cab4b675089ab2@o4510158676099072.ingest.de.sentry.io/4510158794784848",
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
  sentryEnabled = true;
} catch (error) {
  console.warn('Failed to initialize Sentry:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3003;

if (sentryEnabled && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const resourceRoutes = require('./routes/resource.route'); 
const authRoutes = require('./routes/auth.route'); 
const questionRoutes = require('./routes/question.route');
const leaderboardRoutes = require('./routes/leaderboard.route');

connectDB(); 

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.get('/', (req, res) => {
    res.send('Server is running for The Online Kuppiya!');
});

app.use('/api/resources', resourceRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

if (sentryEnabled && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port: ${PORT}`);
    console.log(`Server accessible at: http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});
