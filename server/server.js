const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// Connect to database
connectDB();

// Only listen if not running on Vercel serverless functions
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`ValuePro API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

module.exports = app;

