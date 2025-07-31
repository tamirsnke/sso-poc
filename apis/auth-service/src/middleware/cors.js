const cors = require('cors');
const config = require('../config');

// Enhanced CORS configuration for production
const corsMiddleware = cors({
  ...config.cors,
  origin: function (origin, callback) {
    const isProduction = config.nodeEnv === 'production';
    
    // Allow requests with no origin (like mobile apps or curl requests) only in development
    if (!origin && !isProduction) return callback(null, true);
    
    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
});

module.exports = corsMiddleware;
// Contains AI-generated edits.
