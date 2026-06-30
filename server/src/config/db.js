const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  // If running in Vercel/cloud and no MONGO_URI is configured, skip localhost connection attempts immediately
  if (process.env.VERCEL && (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost'))) {
    console.log('☁️ Vercel Environment detected without remote MONGO_URI. Using local Mock Database.');
    global.useMockDb = true;
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000, // Fail fast in 2 seconds if MongoDB is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.warn(`\n⚠️ MongoDB connection failed: ${error.message}`);
    console.warn('⚙️ Falling back to local in-memory Mock Database for demonstration.');
    console.warn('💡 You can run a local MongoDB instance on port 27017 or set MONGO_URI in .env to use a real database.\n');
    global.useMockDb = true;
  }
};

module.exports = connectDB;

