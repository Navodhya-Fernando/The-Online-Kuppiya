const Sentry = require("@sentry/node");

let sentryEnabled = false;

const initializeSentry = () => {
    const dsn = process.env.SENTRY_DSN;
    
    if (dsn) {
        try {
            Sentry.init({
                dsn: dsn,
                environment: process.env.NODE_ENV || 'development',
                tracesSampleRate: 1.0,
            });
            sentryEnabled = true;
            console.log('✅ Sentry initialized successfully for backend');
        } catch (error) {
            console.error('❌ Failed to initialize Sentry:', error);
        }
    } else {
        console.log('⚠️ Sentry DSN not found. Sentry will not be initialized.');
    }
};

const getSentryInstance = () => {
    return Sentry;
};

const isSentryEnabled = () => {
    return sentryEnabled;
};

module.exports = {
    initializeSentry,
    getSentryInstance,
    isSentryEnabled
};