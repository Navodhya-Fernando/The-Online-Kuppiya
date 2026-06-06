const mongoose = require('mongoose');
const loadEnv = require('./env');

loadEnv();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI not found. MongoDB connection skipped.');
    return null;
  }

  const cachedConnection = global.mongooseConnection || { conn: null, promise: null };
  global.mongooseConnection = cachedConnection;

  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  try {
    if (!cachedConnection.promise) {
      cachedConnection.promise = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    cachedConnection.conn = await cachedConnection.promise;
    console.log(`📦 MongoDB Connected: ${cachedConnection.conn.connection.host}`);
    return cachedConnection.conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;