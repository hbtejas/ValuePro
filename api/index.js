const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

// Connect to MongoDB (falls back to mock DB if unavailable/timeout)
connectDB();

module.exports = app;
